const express = require('express');
const router = express.Router();
const {User, validateUser, hashPass, validateLogin} = require('../models/users');
const bcrypt = require('bcrypt')
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
    try {
        const users = await User.find().populate("addresses")
        res.send(users);
    } catch(err) {
        res.send(err.message);
    }
});

router.get("/account", auth, async (req, res) => {
    const user = await User.findById(req.user._id).select("-password")
    res.send(user);
})

router.post("/create", async (req, res) => {
    const { error } = validateUser(req.body);
    if(error) {
        return res.status(400).send(error.details);
    }
    let user = new User({
        username: req.body.username,
        password: await hashPass(req.body.password),
        email: req.body.email,
        name: req.body.name
    });
    try {
        user = await user.save();
        const accessToken = user.generateToken();
        res.send(accessToken);
    } catch (err) {
        if(err.code===11000 && err.name==="MongoError") {
            return res.status(400).send(`${Object.keys(err.keyValue)[0]} is already in use.`);
        }
        res.send(err.message);
    }
});

router.post("/login", async (req, res) => {
    const { error } = validateLogin(req.body);
    if(error) {
        return res.status(400).send(error.details);
    }
    const user = await User.findOne({username: req.body.username});
    if(!user) return res.status(400).send("Username or Password Did Not Match.");
    try {
        let isValid = await bcrypt.compare(req.body.password, user.password);
        if(!isValid) return res.status(400).send("Username or Password Did Not Match.");
    } catch(err) {
        return res.send(err.message);
    }
    const accessToken = user.generateToken();
    res.send(accessToken);
});

router.put("/:id", auth, async (req, res)=>{
    const { error } = validateUser(req.body);
    if(error) {
        return res.status(400).send(error.details);
    }
    try {
        const user = await User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            password: await hashPass(req.body.password)
        }, {new: true});
        res.send(user);
    } catch(err) {
        res.status(404).send(`User not found with ID: ${req.params.id}`);
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);
        res.send(user);
    } catch (err) {
        res.status(404).send(`User not found with ID: ${req.params.id}`);
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("users");
        res.send(user);
    } catch (err) {
        res.status(404).send(`User not found with ID: ${req.params.id}`)
    }
});

module.exports = router;