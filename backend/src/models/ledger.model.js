const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "account",
        required : [true, "Account is required for a ledger entry"],
        index : true,
        immutable: true
    },
    amount:{
        type: Number,
        required: [true, "Amount is require for a ledger entry"],
        immutable : true
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "transaction",
        required : [true, "Ledger must be associated with transaction"],
        immutable: true,
        index: true
    },
    type:{
        type: String,
        enum : {
            values: ["CREDIT", "DEBIT"],
            message: "type should be either Credit or Debit"
        },
        immutable: true
    }
})

function preventLedgerModification(){
    throw new Error("Ledger should not be modified or updated");
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel