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
  validUntil: {
    type: Date,
  },
});

userSchema.methods.checkMembershipStatus = async function () {
  if (this.membershipType === "Premium" && this.validUntil) {
    const now = new Date();
    if (now > this.validUntil) {
      this.membershipType = "Free";
      this.validUntil = undefined;

      await this.save();
    }
  }
};

userSchema.methods.upgradeAccount = async function () {
  if (this.membershipType === "Free") {
    this.membershipType = "Premium";

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    this.validUntil = oneMonthFromNow;

    await this.save();
  }
};

const User = mongoose.model("user", userSchema);

export default User;
