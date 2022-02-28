const mongoose = require("mongoose");

const sales = new mongoose.Schema({
    emailid:{
        type:String
    },
    commodityname: {
        type:String,
        required:true
    },
    quantity:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date:{
        type:String,
        required:true
    }

})


//creating collection

const Saleitem = new mongoose.model("sale",sales);

module.exports = Saleitem;