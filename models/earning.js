import mongoose from "mongoose";

const Schema = mongoose.Schema;

const earningSchema = new Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

earningSchema.index({ year: 1, month: 1 }, { unique: true });

const Earning = mongoose.model("Earning", earningSchema);

export default Earning;
