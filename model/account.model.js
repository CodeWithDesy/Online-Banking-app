import mongoose from "mongoose";

const {Schema} = mongoose

const accountSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    phone:  { type: Number, required: true },
    password: { type: String, required: true },
    initialDeposit:  { type: Number, required: true },
    accountNumber: { type: Number, required: true },
    accountType: {type: String, enum: ['Savings', 'Current', 'Fixed Deposit'], default: 'Savings'},
    status: {type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active'}, 
    transactions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}]
}, {timestamps: true})

const Account = mongoose.model('Account', accountSchema)

export default Account