const mongoose = require("mongoose");

const medic = new mongoose.Schema({
    email:{
        type:String
    },
    pname: {
        type:String,
        required:true
    },
    ptype:{
        type:String,
        required:true,
    },
    price:{
        type:String,
        required:true
    },
    quantity:{
        type:String,
        required:true
    },
    expdate:{
        type:String,
        required:true
    }

})


const Medlist = new mongoose.model("Medic",medic);

module.exports = Medlist;