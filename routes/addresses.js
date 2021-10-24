const express = require('express');
const router = express.Router();
const {Address, verifyAddress } = require("../models/addresses");
const {User} = require("../models/users");
const auth = require("../middleware/auth");

router.get("/:userId", auth, async (req, res) => {
    try {
        const addr = await Address.find().populate("userId");
        res.send(addr);
    } catch (err) {
        res.send(err.message);
    }
});

router.post("/:userId", auth, async (req, res) => {
    let addr = new Address({
        city: req.body.city,
        userId: req.params.userId,
    });
    try {
        addr = await addr.save();
        await User.findByIdAndUpdate(req.params.userId, {
            $push: {addresses: addr._id}
        });
        res.send(addr);
    } catch (err) {
        res.send(err.message);
    }
});

module.exports = router;