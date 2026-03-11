const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const transactionController = require("../controllers/transcation.controller");

const transactionRoutes = express.Router();

transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);

transactionRoutes.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransfer);

module.exports = transactionRoutes
