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

giftcodeSchema.statics.generateGiftcode = async function () {
  let newCode;

  do {
    newCode = Array(10)
      .fill(null)
      .map(() => Math.random().toString(36).charAt(2).toUpperCase())
      .join("");
  } while (await this.findOne({ code: newCode }));

  const newGiftcode = new this({
    code: newCode,
    isRedeemed: false,
  });

  await newGiftcode.save();
  return newGiftcode;
};

const Giftcode = mongoose.model("giftcode", giftcodeSchema);

export default Giftcode;
