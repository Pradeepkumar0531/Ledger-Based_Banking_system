const express = require("express");
const authController = require("../controllers/auth.controller");

const authRoutes = express.Router();

authRoutes.post("/register", authController.userRegisterController);

authRoutes.post("/login", authController.userLoginController);

authRoutes.post("/logout", authController.userLogoutController)

module.exports = authRoutes