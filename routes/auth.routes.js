const router = require("express").Router()
const User = require("../models/User")
const verifyToken = require("../middleware/verifyToken")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")



router.post("/login",async(req,res)=>{
    // destructure the req.body
    const {username,password} = req.body
    try{
        // 1. check if the user already signed up
        const foundUser = await User.findOne({username})

        // if there isnt a user this means that the user hasnt signed up yet
        if(!foundUser){
            return res.status(401).json({err:"username not signed up. Please sign up"})
        }

        // 2. check if the password given in the req.body matches the passowrd in the DB
        const isPasswordMatch = bcrypt.compareSync(password,foundUser.hashedPassword)
        if(!isPasswordMatch){
            return res.status(401).json({err:"username or password incorrect"})
        }
        // 3. create the JWT token
        const payload = foundUser.toObject()
        delete payload.hashedPassword

        // sign(payload, secret password, expirastion time)
        const token = jwt.sign({payload},process.env.JWT_SECRET,{expiresIn:"30m"})

        res.status(200).json({token})

    }catch(error){
        console.log(error)
        res.status(500).json(error)
    }
})

router.get("/verify",verifyToken,(req,res)=>{
    console.log(req.user)
    res.json(req.user)
})


module.exports = router
