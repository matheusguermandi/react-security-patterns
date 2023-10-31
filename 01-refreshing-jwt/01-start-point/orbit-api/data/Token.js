const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userModel = new Schema({
  refreshToken: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, required: true },
});

module.exports = mongoose.model("token", userModel);
