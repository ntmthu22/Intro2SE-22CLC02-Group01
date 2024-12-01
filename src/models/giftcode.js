import mongoose from "mongoose";

const giftcodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    validUntil: {
      type: Date,
      default: function () {
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        return now;
      },
    },
  },
  {
    timestamps: true,
  }
);

giftcodeSchema.methods.generateGiftcode = async function () {
  const newCode = Array(10)
    .fill(null)
    .map(() => Math.random().toString(36).charAt(2).toUpperCase())
    .join("");

  this.code = newCode;
  this.isRedeemed = false;

  await this.save();
};

const Giftcode = mongoose.model("giftcode", giftcodeSchema);

export default Giftcode;
