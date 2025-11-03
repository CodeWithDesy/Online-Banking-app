const mongoose = require('mongoose');

 const {Schema} = mongoose

const transactionSchema = new Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    accountNumber: {
        type: String,
        required: true  
    },
    type: {
        type: String,
        enum: ['Deposit', 'Withdrawal', 'Transfer'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    isBackdated: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction