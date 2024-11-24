const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  password: {
    type: String,
    required: true,
  },
  /* role: {
    roleName: {
      type: String,
      emum: ['user', 'admin'],
    }

  },
  membershipType: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
  }, */
});

const User = mongoose.model("user", userSchema);

module.exports = User;
