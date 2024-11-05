const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
});

// userSchema.pre("save", async (next) => {
//   if (!this.isModified("password")) return next();

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// userSchema.methods.comparePassword = async (candidatePassword) => {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

const User = mongoose.model("user", userSchema);

module.exports = User;
