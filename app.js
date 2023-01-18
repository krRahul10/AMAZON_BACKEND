require("dotenv").config();
require("./db/conn");

const express = require("express");
const app = express();
const Products = require("./models/productsSchema");
const DefaultData = require("./defaultdata");
const cors = require("cors");
const port = process.env.PORT || 8081;
const router = require("./routes/router");
const cookieParser = require("cookie-parser");


// for deployment

// if (process.env.NODE_ENV == "production") {
//   app.use(express.static("client/build"));
// }

// const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 

// app.use(cors());
app.use(express.json());
app.use(cookieParser(""));
app.use(router);

app.listen(port, () => {
  console.log(`Amazon server start at Your PORT  ${port}`);
});


DefaultData();
