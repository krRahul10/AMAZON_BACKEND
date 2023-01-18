const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRETKEY;

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    reuired: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Not Valid Email Address");
      }
    },
  },

  mobile: {
    type: String,
    required: true,
    maxlength: 10,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  cpassword: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  carts: Array,
});

// this method always use before your model

userSchema.pre("save", async function (next) {
  //isModified ka use isliye h jab hum password ko change karna chaiye tab hi ho wrna ni

  if (this.isModified("password")) {
    //rounds always take maximum bcoz then nobody will decrypt your password

    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  // next() agle kaam ke liye hota h ki ye hone ke baad aage ka kam ho jaye

  next();
});

// token generate here with the help of instance method

userSchema.methods.generateAuthToken = async function () {
  try {
    // token generate jwt sign method se hoga isme 2 parameter pass honge first payload and secretkey

    const generate_token = jwt.sign({ _id: this._id }, secretKey);
    this.tokens = this.tokens.concat({ token: generate_token });
    await this.save();
    return generate_token;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.addCartData = async function (cart) {
  try {
    this.carts = this.carts.concat(cart);
    await this.save()
    return this.carts
  } catch (err) {console.log("err",err);}
};

const USER = new mongoose.model("USER", userSchema);

module.exports = USER;
