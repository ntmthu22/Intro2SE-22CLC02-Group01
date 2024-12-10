import Log from "../models/log.js";
import mongoose from "mongoose";

const userId = "6755494388ab8211044bcecd";

mongoose
  .connect(
    "mongodb+srv://ptbtin22:i6k2WrR2Rhr9AbcS@mongodb-nodejs.hfqzv.mongodb.net/imgconverter"
  )
  .then(() => {
    (async () => {
      const newLog = new Log({
        userId: userId,
        year: 2025,
        month: 1,
        count: 12,
      });
      await newLog.save();
      console.log("saved fake logs");
    })();
  })
  .catch((err) => console.log(err));
