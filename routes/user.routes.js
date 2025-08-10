const router = require("express").Router()
const User = require("../models/User")
const bcrypt = require("bcrypt")

router.post("/create", async (req, res) => {
    try {
        const foundUser = await User.findOne({ username: req.body.username })

        if (foundUser) {
            return res.status(409).json({ err: "username already taken" })
        }
        const createdUser = await User.create({
            username: req.body.username,
            hashedPassword: bcrypt.hashSync(req.body.password, 12)
        })
        console.log(createdUser)


        const convertedObject = createdUser.toObject()
        delete convertedObject.hashedPassword
        res.status(201).json(convertedObject)

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }

})


router.get("/", async (req, res) => {
    try {
        const allUsers = await User.find().select("-hashedPassword -__v")
        res.status(200).json(allUsers)
    }
    catch (error) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
})


router.get("/:userId", async (req, res) => {
    try {
        const allUsers = await User.findById(req.params.userId).select("-hashedPassword -__v")
        res.status(200).json(allUsers)
    }
    catch (error) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
})

module.exports = router