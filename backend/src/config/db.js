const mongoose = require("mongoose");

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Server is connected to MongoDB");
    })
    .catch(err=>{
        console.log("Error while connecting DB");
        process.exit(1);
    })
}

module.exports = connectToDB;