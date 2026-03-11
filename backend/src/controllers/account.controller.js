const accountModel = require("../models/account.model");

async function createAccountController(req, res){
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const account = await accountModel.create({
            user: user._id
        });

        res.status(201).json({
            message: "Account created successfully",
            account
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating account",
            error: error.message
        });
    }
}

async function getUserAccountsController(req, res){
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const accounts = await accountModel.find({ user: req.user._id });
        res.status(200).json({
            accounts
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching accounts",
            error: error.message
        });
    }
}

async function getAccountBalanceController(req, res){
    try {
        const { accountId } = req.params;
        if (!accountId) {
            return res.status(400).json({ message: "Account ID is required" });
        }

        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });
        
        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }
        
        const balance = await account.getBalance();
        res.status(200).json({
            message: "Balance Fetched Successfully",
            accountId: account._id,
            balance: balance
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching balance",
            error: error.message
        });
    }
}

module.exports = {
    createAccountController,
    getUserAccountsController,
    getAccountBalanceController
}