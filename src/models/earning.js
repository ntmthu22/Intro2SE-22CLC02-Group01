import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DEFAULT_AMOUNT = 50000;

const earningSchema = new Schema({
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  value: {
    type: Number,
    default: 0,
  },
});

earningSchema.statics.incEarning = async function () {
  const curMonth = new Date().getMonth() + 1;
  const curYear = new Date().getFullYear();

  try {
    await this.findOneAndUpdate(
      { year: curYear, month: curMonth },
      { $inc: { value: DEFAULT_AMOUNT } },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Error incrementing earnings:", err);
    throw new Error("Could not increment earnings");
  }
};

earningSchema.index({ year: 1, month: 1 }, { unique: true });

const Earning = mongoose.model("Earning", earningSchema);

export default Earning;
