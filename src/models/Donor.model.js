const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const DonorSchema = new mongoose.Schema({
  nationalID: { type: String, required: true, unique: true, minlength: 14, maxlength: 14  },
  name: { type: String, required: true, minlength: 3, maxlength: 100 },
  city: { type: String, required: true },
  email: { type: String, required: true, unique: true, email: true 
  //   ,
  //   validate: {
  //   validator: v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
  //   message: props => `${props.value} is not a valid email address!`
  // }
},
  password :{ type: String, required: true },
}, { timestamps: true });

// Hash password before saving
DonorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with stored hash
DonorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("Donor", DonorSchema);
