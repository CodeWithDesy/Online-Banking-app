import express from "express";
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv";
dotenv.config()

const {Schema} = mongoose

const userSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    dob: {type: String, required: true},
    password: {type: String, required: true},
    isAdmin: {type: Boolean, required: true, default: false},
}, {timestamps: true})

userSchema.pre('save', function (){ 
    const salt = bcrypt.genSaltSync[10]
    const hash = bcrypt.hashSync(this.password, salt)
    this.password = hash
})

userSchema.method('checkPassword', function (password) {
    let valid = bcrypt.compareSync(password, this.password)
    return valid
})

userSchema.method('generateToken', function () {
    let token = JWT.sign({_id: this.id, email: this.email, username: this.username, isAdmin: this.isAdmin,}, process.env.JWT_SECRET, { issuer: 'https://localhost:1980', expiresIn: '2hr'})
    return token
})

const User = mongoose.model('User', userSchema)

export default User