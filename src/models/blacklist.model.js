const mongoose = require("mongoose");
const { create } = require("./transaction.model");

const tokenBlacklistSchema = new mongoose.Schema({
    token : {
        type : String,
        required : [true, "Token is required to put in blacklist"],
        unique : [true, "Token already exists"]
    }
}, {
    timestamps: true
})

tokenBlacklistSchema.index({createdAt : 1},{
    expiredAfterSeconds: 60 * 60 * 24 * 7
})

const tokenBlacklistModel = mongoose.model("tokenBlacklist", tokenBlacklistSchema);

module.exports = tokenBlacklistModel