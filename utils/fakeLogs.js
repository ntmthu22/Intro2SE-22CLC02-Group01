import Log from "../models/log.js";
import mongoose from "mongoose";
import Earning from "../models/earning.js";

const userId = "6755494388ab8211044bcecd";

mongoose
  .connect(
    "mongodb+srv://ptbtin22:i6k2WrR2Rhr9AbcS@mongodb-nodejs.hfqzv.mongodb.net/imgconverter"
  )
  .then(() => {
    (async () => {
      const earn = new Earning({
        year: 2024,
        month: 7,
        value: 600000,
      });
      await earn.save();
    })();
  })
  .catch((err) => console.log(err));
