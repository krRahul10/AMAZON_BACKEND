const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

// *************GET PRODUCTS API *************


router.get("/", (req,res) => {
  res.status(201).json("hello Routes")
})

router.get("/getproducts", async (req, res) => {
  try {
    const productsdata = await Products.find();
    res.status(201).json(productsdata);
    // console.log("console data", productsdata)
  } catch (err) {
    res.status(422).json(err.message);
    // console.log("error", err.message);
  }
});

// ************GET INDIVIDUAL DATA *******

router.get("/getproductsone/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const individualData = await Products.findOne({ id: id });

    // console.log(individualData);

    res.status(201).json(individualData);
  } catch (err) {
    res.status(422).json(err.message);
  }
});

// ************REGISTER API *******

router.post("/register", async (req, res) => {
  // console.log(req.body)
  const { fname, email, mobile, password, cpassword } = req.body;

  if (!fname || !email || !mobile || !password || !cpassword) {
    res.status(422).json({ error: "Fill the all details" });
    // console.log("not data available");
  }

  try {
    const preuser = await USER.findOne({ email: email });

    if (preuser) {
      res.status(422).json({ error: "this user already present" });
    } else if (password !== cpassword) {
      res.status(422).json({ error: "password and cpassword is not match" });
    } else {
      const finalUser = new USER({
        fname,
        email,
        mobile,
        password,
        cpassword,
      });

      // password hashing process is always work before save data

      //here is hashing work with middleware in schema

      const storeData = await finalUser.save();
      // console.log(storeData);
      res.status(201).json(storeData);
    }
  } catch (err) {
    res.status(401).json(err);
  }
});

// ************ LOGIN API *************

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // console.log(email,password)

  if (!email || !password) {
    res.status(400).json({ error: "Please fill all the details" });
  }
  try {
    // valid user me database is email aur body ki email check hogi
    // uske baad wo ek user return hoga database me se
    const validUser = await USER.findOne({ email: email });

    // isMatch me password match hoga frontend aur apne database ka
    // password one way me add hua h isliye bcrypt me compare hoga
    // phle frontend wala password hoga fir validuser ka password hoga

    const isMatch = await bcrypt.compare(password, validUser.password);

    

    if (!isMatch) {
      res.status(400).json({ error: "Invalid Details" });
    } else {
      // token generate after isMatch complete bcoz afterthat we have valid user

    const token = await validUser.generateAuthToken();
    // console.log(token);

    res.cookie("Amazonweb", token, {
      expires: new Date(Date.now() + 9000000),
      httpOnly: true,
    });
      res.status(201).json(validUser);
    }
  } catch (err) {
    res.status(422).json({ error: "Invalid Details" });
  }
});

// ******** ADD TO CART API (adding the data into cart) *********

router.post("/addcart/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Products.findOne({ id: id });

    // console.log("Cart value", cart);

    const UserContact = await USER.findOne({ _id: req.userID });

    // console.log("userContact", UserContact);

    if (UserContact) {
      const cartData = await UserContact.addCartData(cart);
      await UserContact.save();
      console.log("cartData", cartData);
      res.status(201).json(UserContact);
    } else {
      res.status(401).json({ error: "Invalid User" });
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid User" });
  }
});

// ************** GET CART DETAILS API **************

router.get("/cartdetails", authenticate, async (req, res) => {
  try {
    const buyUser = await USER.findOne({ _id: req.userID });
    res.status(201).json(buyUser);
  } catch (error) {
    console.log("error", error);
  }
});

// ****************get valid user ***********

router.get("/validuser", authenticate, async (req, res) => {
  try {
    const validUserOne = await USER.findOne({ _id: req.userID });
    res.status(201).json(validUserOne);
  } catch (error) {
    console.log("error", error);
  }
});

// ********** REMOVE ITEM FROM CART *********

router.delete("/remove/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    req.rootUser.carts = req.rootUser.carts.filter((elem) => {
      return elem.id !== id;
    });
    req.rootUser.save();
    res.status(201).json(req.rootUser);
  } catch (error) {
    res.status(401).json(error);
  }
});

// *********** LOGOUT USER API ******

router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((elem) => {
      return elem.token !== req.token;
    });
    res.clearCookie("Amazonweb", { path: "/" });
    req.rootUser.save();
    res.status(201).json(req.rootUser.tokens);
    console.log("user LogOut");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
