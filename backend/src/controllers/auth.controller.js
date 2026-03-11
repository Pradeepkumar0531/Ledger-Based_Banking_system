const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service")
const tokenBlacklistModel = require("../models/blacklist.model");

async function userRegisterController(req, res){
    try {
        const {email, password, name} = req.body;

        // Input validation
        if (!email || !password || !name) {
            return res.status(400).json({
                message: "Email, password, and name are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const isExists = await userModel.findOne({
            email: email.toLowerCase()
        });

        if(isExists){
            return res.status(422).json({
                message: "Email already exists",
                status: "failed"
            });
        }

        const user = await userModel.create({
            email: email.toLowerCase(),
            password,
            name
        });

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"});
        res.cookie("token", token);
        res.status(201).json({
            user:{
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
        
        // Send welcome email asynchronously (don't wait for it)
        emailService.sendRegistrationEmail(user.email, user.name).catch(err => 
            console.error("Failed to send registration email:", err)
        );
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Error during registration",
            error: error.message
        });
    }
}

async function userLoginController(req, res){
    try {
        const {email, password} = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({email: email.toLowerCase()}).select("+password");

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        
        const isValidPassword = await user.comparePassword(password);
        if(!isValidPassword){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"});
        res.cookie("token", token);
        res.status(200).json({
            user:{
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Error during login",
            error: error.message
        });
    }
}

async function userLogoutController(req, res){
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token){
            return res.status(400).json({
                message: "You are already logged out"
            });
        }
        
        await tokenBlacklistModel.create({
            token: token
        });

        res.clearCookie("token");

        res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            message: "Error during logout",
            error: error.message
        });
    }
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}