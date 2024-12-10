import mongoose from "mongoose";

const Schema = mongoose.Schema;

const logSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

logSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

const Log = mongoose.model("log", logSchema);

export default Log;
