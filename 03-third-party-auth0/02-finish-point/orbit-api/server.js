require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("express-jwt");
const jwtAuthz = require("express-jwt-authz");
const jwks = require("jwks-rsa");
const jwtDecode = require("jwt-decode");
const mongoose = require("mongoose");
const dashboardData = require("./data/dashboard");
const User = require("./data/User");
const InventoryItem = require("./data/InventoryItem");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const attachUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Authentication invalid" });
  }
  const decodedToken = jwtDecode(token.slice(7));

  if (!decodedToken) {
    return res.status(401).json({
      message: "There was a problem authorizing the request",
    });
  } else {
    req.user = decodedToken;
    next();
  }
};

app.use(attachUser);

const requireAuth = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH0_JWKS_URI,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_JWKS_ISSUER,
  algorithms: ["RS256"],
});

const getUserId = (user) => {
  // return user[`${process.env.AUTH0_JWT_NAMESPACE}/sub`];
  return user["sub"];
};

app.get(
  "/api/dashboard-data",
  requireAuth,
  jwtAuthz(["read:dashboard"]),
  (req, res) => res.json(dashboardData)
);

app.patch(
  "/api/user-role",
  requireAuth,
  jwtAuthz(["edit:user"]),
  async (req, res) => {
    try {
      const { role } = req.body;
      const userId = getUserId(req.user);
      const allowedRoles = ["user", "admin"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Role not allowed" });
      }
      await User.findOneAndUpdate({ _id: userId }, { role });
      res.json({
        message:
          "User role updated. You must log in again for the changes to take effect.",
      });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }
);

app.get(
  "/api/inventory",
  requireAuth,
  jwtAuthz(["read:inventory"]),
  async (req, res) => {
    try {
      const userId = getUserId(req.user);
      const inventoryItems = await InventoryItem.find({
        user: userId,
      });
      res.json(inventoryItems);
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }
);

app.post(
  "/api/inventory",
  requireAuth,
  jwtAuthz(["write:inventory"]),
  async (req, res) => {
    console.log("req");
    try {
      const userId = getUserId(req.user);
      const input = Object.assign({}, req.body, {
        user: userId,
      });
      const inventoryItem = new InventoryItem(input);
      await inventoryItem.save();
      res.status(201).json({
        message: "Inventory item created!",
        inventoryItem,
      });
    } catch (err) {
      return res.status(400).json({
        message: "There was a problem creating the item",
      });
    }
  }
);

app.delete(
  "/api/inventory/:id",
  requireAuth,
  jwtAuthz(["delete:inventory"]),
  async (req, res) => {
    try {
      const userId = getUserId(req.user);
      const deletedItem = await InventoryItem.findOneAndDelete({
        _id: req.params.id,
        user: userId,
      });
      res.status(201).json({
        message: "Inventory item deleted!",
        deletedItem,
      });
    } catch (err) {
      return res.status(400).json({
        message: "There was a problem deleting the item.",
      });
    }
  }
);

app.get(
  "/api/users",
  requireAuth,
  jwtAuthz(["read:users"]),
  async (req, res) => {
    try {
      const users = await User.find()
        .lean()
        .select("_id firstName lastName avatar bio");

      res.json({
        users,
      });
    } catch (err) {
      return res.status(400).json({
        message: "There was a problem getting the users",
      });
    }
  }
);

app.get("/api/bio", requireAuth, jwtAuthz(["read:user"]), async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const user = await User.findOne({
      _id: userId,
    })
      .lean()
      .select("bio");

    res.json({
      bio: user.bio,
    });
  } catch (err) {
    return res.status(400).json({
      message: "There was a problem updating your bio",
    });
  }
});

app.patch(
  "/api/bio",
  requireAuth,
  jwtAuthz(["edit:user"]),
  async (req, res) => {
    try {
      const userId = getUserId(req.user);
      const { bio } = req.body;
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
        },
        {
          bio,
        },
        {
          new: true,
        }
      );

      res.json({
        message: "Bio updated!",
        bio: updatedUser.bio,
      });
    } catch (err) {
      return res.status(400).json({
        message: "There was a problem updating your bio",
      });
    }
  }
);

async function connect() {
  try {
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.ATLAS_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  } catch (err) {
    console.log("Mongoose error", err);
  }
  app.listen(3001);
  console.log("API listening on localhost:3001");
}

connect();
