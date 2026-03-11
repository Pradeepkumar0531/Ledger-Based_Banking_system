const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const accountController = require("../controllers/account.controller")

const accountRoutes = express.Router();

accountRoutes.post("/", authMiddleware.authMiddleware, accountController.createAccountController);

accountRoutes.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController);

accountRoutes.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)

module.exports = accountRoutes