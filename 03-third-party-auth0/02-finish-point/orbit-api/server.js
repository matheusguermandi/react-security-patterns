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
