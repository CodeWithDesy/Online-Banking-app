import Transaction from "../model/transaction.model.js";
import Account from "../model/account.model.js";

async function createTransaction(req, res) {
  try {
    const { customerId, type, amount, description } = req.body;

    if (!customerId || !type || !amount || !description) {
      return res.status(400).json({
        message: "All fields are required: customerId, type, amount, description",
      });
    }

    if (!["Deposit", "Withdrawal", "Transfer"].includes(type)) {
      return res.status(400).json({
        message:
          "Invalid transaction type. Must be Deposit, Withdrawal, or Transfer",
      });
    }

    const account = await Account.findById(customerId).populate("transactions");
    if (!account) {
      return res.status(404).json({
        message: "Customer account not found",
      });
    }

    let currentBalance = account.initialDeposit || 0;
    if (account.transactions.length > 0) {
      currentBalance =
        account.transactions[account.transactions.length - 1].balance;
    }

    // Handle amount based on type
    const transactionAmount = Math.abs(parseFloat(amount));
    let newBalance = currentBalance;

    if (type === "Deposit") {
      newBalance += transactionAmount;
    } else {
      newBalance -= transactionAmount;
      if (newBalance < 0) {
        return res.status(400).json({
          message: "Insufficient balance for this transaction",
        });
      }
    }

    const transaction = await Transaction.create({
      customerId,
      accountNumber: account.accountNumber, // ← ADD THIS LINE
      type,
      amount: type === "Deposit" ? transactionAmount : -transactionAmount,
      description,
      balance: newBalance,
      date: new Date(),
    });

    account.transactions.push(transaction._id);
    account.initialDeposit = newBalance;
    await account.save();

    res.status(201).json({
      message: "Transaction completed successfully",
      data: {
        transaction,
        newBalance,
      },
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      message: "Server error while processing transaction",
      error: error.message,
    });
  }
}

async function backdateTransaction(req, res) {
  try {
    const { customerId, type, amount, date, description } = req.body;

    console.log('📥 Received backdate request:', { customerId, type, amount, date, description });

    if (!customerId || !type || !amount || !date || !description) {
      return res.status(400).json({
        message:
          "All fields are required: customerId, type, amount, date, description",
      });
    }

    if (!["Deposit", "Withdrawal", "Transfer"].includes(type)) {
      return res.status(400).json({
        message:
          "Invalid transaction type. Must be Deposit, Withdrawal, or Transfer",
      });
    }

    const account = await Account.findById(customerId).populate("transactions");
    if (!account) {
      return res.status(404).json({
        message: "Customer account not found",
      });
    }

    console.log('✅ Account found:', account.name);
    console.log('💰 Current balance:', account.initialDeposit);
    console.log('🔢 Account number:', account.accountNumber); // Add this

    // Get current balance
    let currentBalance = account.initialDeposit || 0;
    if (account.transactions.length > 0) {
      currentBalance =
        account.transactions[account.transactions.length - 1].balance;
    }

    // Handle amount based on type
    const transactionAmount = Math.abs(parseFloat(amount)); // Always use absolute value
    let newBalance = currentBalance;

    if (type === "Deposit") {
      newBalance += transactionAmount;
    } else { // Withdrawal or Transfer
      newBalance -= transactionAmount;
      if (newBalance < 0) {
        return res.status(400).json({
          message: "Insufficient balance for withdrawal/transfer",
        });
      }
    }

    console.log('💰 New balance will be:', newBalance);

    // Create transaction with backdated date and accountNumber
    const transaction = await Transaction.create({
      customerId,
      accountNumber: account.accountNumber, // ← ADD THIS LINE
      type,
      amount: type === "Deposit" ? transactionAmount : -transactionAmount,
      description,
      balance: newBalance,
      date: new Date(date),
      isBackdated: true,
    });

    console.log('✅ Transaction created:', transaction._id);

    // Update account
    account.transactions.push(transaction._id);
    account.initialDeposit = newBalance;
    await account.save();

    console.log('✅ Account updated successfully');

    res.status(201).json({
      message: "Backdated transaction created successfully",
      data: {
        transaction,
        newBalance,
      },
    });
  } catch (error) {
    console.error("❌ Error creating backdated transaction:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      message: "Server error while creating transaction",
      error: error.message,
    });
  }
}

async function fetchCustomerTransactions(req, res) {
  try {
    const customerId = req.params.customerId;

    const transactions = await Transaction.find({ customerId }).sort({
      date: -1,
    });

    res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "Server error while fetching transactions",
    });
  }
}

export {
    backdateTransaction,
    fetchCustomerTransactions,
    createTransaction
};

