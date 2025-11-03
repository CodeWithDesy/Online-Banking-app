const JWT = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const isTokenValid = (req, res, next) => {
    try {
        const longToken = req.headers.authorization
        if (!longToken) {
            res.status(401).json({messsage: 'Token not present'})
        } else {
            const token = longToken.split(' ')[1]
            let user = JWT.verify(token, process.env.JWT_SECRET)
            req.user = user
            next()
        }
    } catch (error) {
      console.log(error) 
      res.status(401).json({message: 'Invalid token'})  
    }
}

const isUserAdmin = (req, res, next) => {
    try {
        const longToken = req.headers.authorization
        if (!longToken) {
            res.status(401).json({messsage: 'Token not present'})
        } else {
            const token = longToken.split(' ')[1]
            let user = JWT.verify(token, process.env.JWT_SECRET)
            if (user.isAdmin) {
                req.user = user
                next()
            } else{
                res.status(403).json({message: 'Forbidden!, only admins can perform action'})
            }
        }
    } catch (error) {
      console.log(error) 
      res.status(401).json({message: 'Invalid token'})  
    }
}

module.exports = {isTokenValid, isUserAdmin}