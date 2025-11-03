const mongoose = require('mongoose')

const {Schema} = mongoose

const accountSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    phone:  { type: Number, required: true },
    initialDeposit:  { type: Number, required: true },
    accountNumber: {type: String, required: true, unique: true},
    transactions: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}]
}, {timestamps: true})

const Account = mongoose.model('Account', accountSchema)

module.exports = Account