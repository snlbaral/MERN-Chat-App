const express = require('express')
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/conversations');
const Message = require('../models/messages')
const mongoose = require('mongoose')

router.get('/conversations', auth, async (req, res) =>{
    try {
        const conversations = await Conversation.find().or([{senderId: req.user._id}, {receiverId: req.user._id}]).populate('senderId').populate('receiverId');
        res.send(conversations);
    } catch(err) {
        res.status(503).send(err.message);
    }
})

router.get('/conversations/:id', auth, async (req, res)=>{
    try {
        const messages = await Message.find({conversationId: req.params.id});
        res.send(messages);
    } catch(err) {
        res.status(503).send(err.message);
    }
})

router.post('/conversation/new', auth, async (req, res)=>{
    const alreadyConvo = await Conversation.findOne().or([{senderId: req.user._id, receiverId: req.body.receiverId},{receiverId: req.user._id, senderId: req.body.receiverId}]).populate('senderId').populate('receiverId');
    if(alreadyConvo) {
        return res.send(alreadyConvo);
    }
    let data = new Conversation({
        'senderId': req.user._id,
        'receiverId': req.body.receiverId
    }).populate('senderId').populate('receiverId');

    try {
        data = await data.save();
        res.send(data);
    } catch(err) {
        res.status(503).send(err.message);
    }    
})

router.post('/conversations/:id', auth, async (req, res)=>{
    let message = new Message({
        'messageBy': req.user._id,
        'message': req.body.message,
        'conversationId': req.params.id
    });
    try {
        message = await message.save();
        res.send(message)
    } catch(err) {
        res.status(503).send(err.message);
    }
})

async function checkConversation(userId, senderId, receiverId) {
    try {
        const conversation = await Conversation.findOne().or({senderId: userId, receiverId: userId});
    } catch(err) {
        return false;
    }
    if(!conversation) {
        const data = new Conversation({
            'senderId': senderId,
            'receiverId': receiverId
        });
        try {
            await data.save();
        } catch(err) {
            return false;
        }
    }
    return true;
}


module.exports = router;