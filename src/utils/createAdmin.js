import User from "../models/user.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://ptbtin22:i6k2WrR2Rhr9AbcS@mongodb-nodejs.hfqzv.mongodb.net/imgconverter"
  )
  .then(() => {
    (async () => {
      const hashedPassword = await bcrypt.hash("admin123", 12);

      const user = new User({
        name: "ADMIN2",
        email: "admin2@gmail.com",
        password: hashedPassword,
        role: "Admin",
      });

      try {
        await user.save();
        console.log("Admin user created successfully.");
      } catch (error) {
        console.error("Error creating admin user:", error);
      }
    })();
  })
  .catch((err) => console.log(err));
