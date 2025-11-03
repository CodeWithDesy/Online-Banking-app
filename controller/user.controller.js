const User = require('../model/user.model')

 async function signupUser(req, res) {
    try {
      const userExist = await User.findOne({email: req.body.email})
      if (userExist) {
         res.status(200).json({message: 'User already exist'})
      } else {
         const user = new User(req.body)
        await user.save()
        const token = user.generateToken()
        res.status(200).json({message: 'User created successfully', data: user, token})
      }
    } catch (error) {
       console.log(error) 
       res.status(500).json({message: 'server error'})
    }
 }

 async function loginUser(req, res) {
    try {
        let userExist = await User.findOne({email: req.body.email})
        if (!userExist) {
          res.status(404).json({message: 'User not found, please signup'})
        } else {
         const passwordMatch = userExist.checkPassword(req.body.password)
         if (passwordMatch) {
            const token = userExist.generateToken()
            res.status(200).json({message: 'User login successfully', data: userExist, token})
         } else {
           res.status(401).json({message: 'Incorrect Password'}) 
         }
        }
    } catch (error) {
       console.log(error) 
       res.status(500).json({message: 'server error'})
    }
 } 

 module.exports = {signupUser, loginUser}