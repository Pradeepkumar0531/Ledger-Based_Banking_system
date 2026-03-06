const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : [true, "Account should be associated with an user"],
        index : true
    },
    status : {
        enum : {
            values : ["ACTIVE", "FROZEN", "INACTIVE"],
            message : "Status can be either active or frozen or inactive"
        }
    },
    currency: {
        type : String,
        required : [true, "Currency is required for creating an account"],
        default : "INR",
    }
},{
    timestamps : true
})

module.exports = accountSchema