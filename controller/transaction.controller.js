const Transaction = require('../model/transaction.model');
const Account = require('../model/account.model');

// Create Transaction (Deposit/Withdrawal/Transfer)
async function createTransaction(req, res) {
    try {
        const { customerId, type, amount, description } = req.body;

        console.log('Creating transaction:', { customerId, type, amount });

        // Validate required fields
        if (!customerId || !type || !amount || !description) {
            return res.status(400).json({ 
                message: 'All fields are required: customerId, type, amount, description' 
            });
        }

        // Validate transaction type
        if (!['Deposit', 'Withdrawal', 'Transfer'].includes(type)) {
            return res.status(400).json({ 
                message: 'Invalid transaction type. Must be Deposit, Withdrawal, or Transfer' 
            });
        }

        // Find the customer account
        const account = await Account.findById(customerId).populate('transactions');

        if (!account) {
            return res.status(404).json({ 
                message: 'Customer account not found' 
            });
        }

        // Calculate new balance
        let newBalance = account.initialDeposit || 0;

        // If there are existing transactions, get the latest balance
        if (account.transactions && account.transactions.length > 0) {
            const latestTransaction = account.transactions[account.transactions.length - 1];
            newBalance = latestTransaction.balance;
        }

        // Adjust balance based on transaction type
        if (type === 'Deposit') {
            newBalance += parseFloat(amount);
        } else if (type === 'Withdrawal' || type === 'Transfer') {
            newBalance -= parseFloat(amount);
            
            // Check if sufficient balance
            if (newBalance < 0) {
                return res.status(400).json({ 
                    message: 'Insufficient balance for this transaction' 
                });
            }
        }

        // Create the transaction
        const transaction = new Transaction({
            customerId: customerId,
            type: type,
            amount: parseFloat(amount),
            description: description,
            balance: newBalance,
            date: new Date()
        });

        await transaction.save();

        // Add transaction to account
        account.transactions.push(transaction._id);
        
        // Update account balance
        account.initialDeposit = newBalance;
        
        await account.save();

        console.log('Transaction created successfully:', transaction);

        res.status(201).json({
            message: 'Transaction completed successfully',
            data: {
                transaction: transaction,
                newBalance: newBalance
            }
        });

    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ 
            message: 'Server error while processing transaction',
            error: error.message 
        });
    }
}

// Backdate Transaction (existing function - keep as is)
async function backdateTransaction(req, res) {
    try {
        const { customerId, type, amount, date, description } = req.body;

        console.log('Creating backdated transaction:', { customerId, type, amount, date, description });

        if (!customerId || !type || !amount || !date || !description) {
            return res.status(400).json({ 
                message: 'All fields are required: customerId, type, amount, date, description' 
            });
        }

        if (!['Deposit', 'Withdrawal', 'Transfer'].includes(type)) {
            return res.status(400).json({ 
                message: 'Invalid transaction type. Must be Deposit, Withdrawal, or Transfer' 
            });
        }

        const account = await Account.findById(customerId).populate('transactions');

        if (!account) {
            return res.status(404).json({ 
                message: 'Customer account not found' 
            });
        }

        let newBalance = account.initialDeposit || 0;

        if (account.transactions && account.transactions.length > 0) {
            const latestTransaction = account.transactions[account.transactions.length - 1];
            newBalance = latestTransaction.balance;
        }

        if (type === 'Deposit') {
            newBalance += parseFloat(amount);
        } else if (type === 'Withdrawal' || type === 'Transfer') {
            newBalance -= parseFloat(amount);
            
            if (newBalance < 0) {
                return res.status(400).json({ 
                    message: 'Insufficient balance for withdrawal/transfer' 
                });
            }
        }

        const transaction = new Transaction({
            customerId: customerId,
            type: type,
            amount: parseFloat(amount),
            description: description,
            balance: newBalance,
            date: new Date(date),
            isBackdated: true
        });

        await transaction.save();

        account.transactions.push(transaction._id);
        account.initialDeposit = newBalance;
        
        await account.save();

        console.log('Backdated transaction created successfully:', transaction);

        res.status(201).json({
            message: 'Backdated transaction created successfully',
            data: {
                transaction: transaction,
                newBalance: newBalance
            }
        });

    } catch (error) {
        console.error('Error creating backdated transaction:', error);
        res.status(500).json({ 
            message: 'Server error while creating transaction',
            error: error.message 
        });
    }
}

// Fetch all transactions for a customer
async function fetchCustomerTransactions(req, res) {
    try {
        const customerId = req.params.customerId;

        const transactions = await Transaction.find({ customerId: customerId })
            .sort({ date: -1 }); // Sort by date, newest first

        res.status(200).json({
            message: 'Transactions fetched successfully',
            data: transactions
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ 
            message: 'Server error while fetching transactions',
            error: error.message 
        });
    }
}

module.exports = {createTransaction, backdateTransaction, fetchCustomerTransactions};