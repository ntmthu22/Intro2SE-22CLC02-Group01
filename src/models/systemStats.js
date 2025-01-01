import mongoose from "mongoose";

const Schema = mongoose.Schema;

const systemStatsSchema = new Schema({
  earnings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Earning",
    },
  ],
  totalUsers: {
    type: Number,
    default: 0,
  },
  activeAccounts: {
    type: Number,
    default: 0,
  },
  disabledAccounts: {
    type: Number,
    default: 0,
  },
});

const SystemStats = mongoose.model("SystemStats", systemStatsSchema);

export default SystemStats;
