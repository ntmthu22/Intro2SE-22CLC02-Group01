import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
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
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    status: {
      type: String,
      enum: ["active", "disabled", "banned"],
      default: "active",
    },
    loginTimestamps: [Date],
  },
  { timestamps: true }
);

userSchema.methods.downgrade = async function () {
  this.membershipType = "Free";
  this.validUntil = undefined;
  await this.save();
};

userSchema.methods.checkMembershipStatus = async function () {
  if (this.membershipType === "Premium" && this.validUntil) {
    const now = new Date();
    if (now > this.validUntil) {
      await this.downgrade();
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
