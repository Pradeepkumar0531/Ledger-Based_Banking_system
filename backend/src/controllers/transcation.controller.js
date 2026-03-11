const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");
 
async function createTransaction(req, res){
    try {
        const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

        // 1. Validate Request
        if (!fromAccount || !toAccount || !amount || !idempotencyKey){
            return res.status(400).json({
                message: "fromAccount, toAccount, amount, idempotencyKey are required"
            });
        }
        
        const fromUserAccount = await accountModel.findOne({
            _id : fromAccount
        });

        const toUserAccount = await accountModel.findOne({
            _id : toAccount
        });

        if (!fromUserAccount || !toUserAccount){
            return res.status(400).json({
                message: "Invalid fromAccount or toAccount"
            });
        }

        // 2.Validate Idempotency Key
        const isTransactionAlreadyExists = await transactionModel.findOne({
            idempotencyKey:idempotencyKey
        });
        if (isTransactionAlreadyExists){
            if (isTransactionAlreadyExists.status == 'COMPLETED'){
                return res.status(200).json({
                    message : "Transaction has already completed",
                    transaction : isTransactionAlreadyExists
                });
            }
            if (isTransactionAlreadyExists.status == 'PENDING'){
                return res.status(200).json({
                    message : "Transaction is still in pending"
                })
            }
            if (isTransactionAlreadyExists.status == 'FAILED'){
                return res.status(500).json({
                    message : "Transaction failed previously, Try again"
                })
            }
            if (isTransactionAlreadyExists.status == 'REVERSED'){
                return res.status(500).json({
                    message : "Transaction reversed, Try again"
                })
            }

        }

        //3. Check account status
        if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE'){
            return res.status(400).json({
                message : "FromAccount and TOaccount should be ACTIVE"
            });
        }

        //4. Derive sender balance from ledger
        const balance = await fromUserAccount.getBalance();
        if (balance < amount){
            return res.status(400).json({
                message : `Balance is Insufficient. Current Balance is ${balance}. Requested amount is ${amount}`
            });
        }

        //5. Create Transaction
        let transaction;
        const session = await mongoose.startSession();
        session.startTransaction();
    
        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status : "PENDING"
        }],{session}))[0]
    
        const debitLedgerEntry = await ledgerModel.create([{
            account : fromAccount,
            amount : amount,
            transaction : transaction._id,
            type : "DEBIT"
        }],{session});
        
        await (()=>{
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000))
        })()
    
        const creditLedgerEntry = await ledgerModel.create([{
            account : toAccount,
            amount : amount,
            transaction : transaction._id,
            type : "CREDIT"
        }], {session});
    
        await transactionModel.findOneAndUpdate(
            {_id: transaction._id},
            {status: "COMPLETED"},
            {session}
        )
        await transaction.save({session});
    
        await session.commitTransaction();
        session.endSession();

        // Send email asynchronously
        emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount).catch(err =>
            console.error("Failed to send transaction email:", err)
        );

        return res.status(201).json({
            message: "Transaction Completed Successfully",
            transaction: transaction
        });
    } catch(error){
        console.error("Transaction error:", error);
        return res.status(500).json({
            message: "Error processing transaction",
            error: error.message
        })
    }
}

async function createInitialFundsTransfer(req, res){
    try {
        const {toAccount, amount, idempotencyKey} = req.body;

        if (!toAccount || !amount || !idempotencyKey){
            return res.status(400).json({
                message: "toAccount, amount, idempotencyKey are required"
            });
        }
        const toUserAccount = await accountModel.findOne({
            _id : toAccount
        })
        if (!toUserAccount){
            return res.status(400).json({
                message:"Invalid account"
            })
        }

        const fromUserAccount = await accountModel.findOne({
            user: req.user._id
        })
        if (!fromUserAccount){
            return res.status(400).json({
                message: "System user not found"
            })
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        });

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }],{session});

        const creditLedgerEntry = await ledgerModel.create([{
            account : toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }],{session});

        transaction.status = "COMPLETED";
        await transaction.save({session});

        await session.commitTransaction();
        session.endSession();
        
        return res.status(201).json({
            message: "Initial funds successfully transferred",
            transaction: transaction
        });
    } catch(error) {
        console.error("Initial funds transfer error:", error);
        return res.status(500).json({
            message: "Error transferring funds",
            error: error.message
        });
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransfer
}
