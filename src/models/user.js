import mongoose from "mongoose";

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
  role: {
    type: String,
    enum: ["User", "Admin"],
    default: "User",
  },
  membershipType: {
    type: String,
    enum: ["Free", "Premium"],
    default: "Free",
  },
});

const User = mongoose.model("user", userSchema);

export default User;
