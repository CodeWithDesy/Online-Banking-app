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

    let newBalance = account.initialDeposit || 0;
    if (account.transactions.length > 0) {
      newBalance =
        account.transactions[account.transactions.length - 1].balance;
    }

    if (type === "Deposit") {
      newBalance += parseFloat(amount);
    } else {
      newBalance -= parseFloat(amount);
      if (newBalance < 0) {
        return res.status(400).json({
          message: "Insufficient balance for this transaction",
        });
      }
    }

    const transaction = await Transaction.create({
      customerId,
      type,
      amount: parseFloat(amount),
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
    });
  }
}

async function backdateTransaction(req, res) {
  try {
    const { customerId, type, amount, date, description } = req.body;

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

    let newBalance = account.initialDeposit || 0;
    if (account.transactions.length > 0) {
      newBalance =
        account.transactions[account.transactions.length - 1].balance;
    }

    if (type === "Deposit") {
      newBalance += parseFloat(amount);
    } else {
      newBalance -= parseFloat(amount);
      if (newBalance < 0) {
        return res.status(400).json({
          message: "Insufficient balance for withdrawal/transfer",
        });
      }
    }

    const transaction = await Transaction.create({
      customerId,
      type,
      amount: parseFloat(amount),
      description,
      balance: newBalance,
      date: new Date(date),
      isBackdated: true,
    });

    account.transactions.push(transaction._id);
    account.initialDeposit = newBalance;
    await account.save();

    res.status(201).json({
      message: "Backdated transaction created successfully",
      data: {
        transaction,
        newBalance,
      },
    });
  } catch (error) {
    console.error("Error creating backdated transaction:", error);
    res.status(500).json({
      message: "Server error while creating transaction",
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

