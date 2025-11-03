const Account = require('../model/account.model');

async function createAccount(req, res) {
    try {
        const account = new Account (req.body)
        console.log(req.body);
        await account.save()
        res.status(201).json({message: 'Account created successfully', data: account})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'server error'})
    }
}

async function fetchAccount(req, res) {
    try {
        const accounts = await Account.find({})
        res.status(201).json({message: 'Customers account fetched successfully', data: accounts})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'server error'})
    }
}

async function fetchAccountById(req, res) {
    try {
        const accountId = req.params.id
        const accounts = await Account.findById(accountId)
        res.status(201).json({message: 'Customer Account fetched successfully', data: accounts})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'server error'})
    }
}

async function fetchAccountAndUpdate(req, res) {
    try {
        const accountId = req.params.id
        const { name, email, phone, initialDeposit } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({message: 'Name, email, and phone are required fields'});
        }
        const accounts = await Account.findByIdAndUpdate(accountId, {name, email, phone, initialDeposit}, {new: true})
        res.status(200).json({message: 'Customer Account updated successfully', data: accounts})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'server error'})
    }
}

 async function basePath(req, res) {
    try {
        res.status(500).json({message: 'undefined route'})
    } catch (error) {
       console.log(error) 
       res.status(500).json({message: 'server error'})
    }
 }

 async function falsePath(req, res) {
    try {
       res.status(500).json({message: 'undefined route'}) 
    } catch (error) {
       console.log(error) 
       res.status(500).json({message: 'server error'}) 
    }
 }

 module.exports = {basePath, falsePath, createAccount, fetchAccount, fetchAccountById, fetchAccountAndUpdate}