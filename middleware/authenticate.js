const jwt = require("jsonwebtoken");
const USER = require("../models/userSchema");
const secretKey = process.env.SECRETKEY;

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.Amazonweb;
    console.log("cookies token", token);

    const verifyToken = jwt.verify(token, secretKey);

    console.log("verifyToken", verifyToken);

    const rootUser = await USER.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });

    console.log("rootUser", rootUser);

    if(!rootUser){
        throw new Error("User Not Found")
    }
    req.token = token
    req.rootUser = rootUser
    req.userID = rootUser._id

    next()
  } catch (err) {
    res.status(401).json("Unautherized:No Token Provide")
  }
};

module.exports = authenticate
