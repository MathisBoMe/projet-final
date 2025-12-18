const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    ratings: {
      type: Map,
      of: Number,
      default: {},
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false // Ne pas retourner par défaut dans les requêtes
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
