import Log from "../models/log.js";
import mongoose from "mongoose";
import Earning from "../models/earning.js";
import User from "../models/user.js";

const userId = "6758b8d0345de69e1d5c2029";

mongoose
  .connect(
    "mongodb+srv://ptbtin22:i6k2WrR2Rhr9AbcS@mongodb-nodejs.hfqzv.mongodb.net/imgconverter"
  )
  .then(() => {
    (async () => {
      const user = await User.findById(userId);

      await user.checkMembershipStatus();
    })();
  })
  .catch((err) => console.log(err));
