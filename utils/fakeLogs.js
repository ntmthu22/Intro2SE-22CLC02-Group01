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
      await Earning.incEarning();
    })();
  })
  .catch((err) => console.log(err));
