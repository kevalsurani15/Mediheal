const mongoose = require("mongoose");

const registeration = new mongoose.Schema({
    shopname: {
        type:String,
        required:true
    },
    emailid:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    }

})


//creating collection

const Register = new mongoose.model("registeration",registeration);

module.exports = Register;