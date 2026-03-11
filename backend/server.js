const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") })

const connectToDB = require("./src/config/db");
const app = require("./src/app");

connectToDB()

app.listen(5000, () =>{
    console.log("Server is running on port 5000.");
});