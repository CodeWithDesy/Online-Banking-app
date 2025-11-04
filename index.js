const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('MONGO_URI length:', process.env.MONGO_URI?.length);
console.log('MONGO_URI starts with:', process.env.MONGO_URI?.substring(0, 20));
console.log('===================================');

const { signupUser, loginUser } = require('./controller/user.controller')
const { validateSignupMiddleware, validateLoginMiddleware } = require('./validator/auth.validator')
const { createAccount, fetchAccount, fetchAccountById, basePath, falsePath, fetchAccountAndUpdate } = require('./controller/account.controller')
const { isUserAdmin, isTokenValid } = require('./middleware')
const { backdateTransaction, fetchCustomerTransactions } = require('./controller/transaction.controller')

const api = express()

const PORT = 1977

api.use(cors({
    origin: '*', // Allow all origins for testing
    credentials: true
}));

api.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

api.use(express.json())
api.use(express.urlencoded({extended:true}))

api.post('/user',validateSignupMiddleware, signupUser)
api.post('/login', validateLoginMiddleware, loginUser)

api.post('/account', createAccount)
api.get('/accounts', fetchAccount)
api.get('/accounts/:id', fetchAccountById)
api.put('/accounts/:id', fetchAccountAndUpdate)

api.post('/transactions/backdate', backdateTransaction)
api.get('/transactions/:customerId', fetchCustomerTransactions)

api.all('/', basePath)
api.use(falsePath)



api.listen(PORT, async () => {
    console.log(`Server live on ${PORT}`)
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/linzBank';
    console.log('Connecting to:', MONGO_URI.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB');
    await mongoose.connect(MONGO_URI);
    console.log('database connected')
})