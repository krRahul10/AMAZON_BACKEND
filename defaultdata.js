const Products = require("./models/productsSchema");
const productsdata = require("./constant/productsdata");

const DefaultData = async () => {
    try{
        //delete many stop to make repeatedly call and store data
        await Products.deleteMany({})

        const storeData = await Products.insertMany(productsdata)
        
        // console.log(storeData)

    }catch(err){

        console.log("error",err.message);
    }
}

module.exports = DefaultData
