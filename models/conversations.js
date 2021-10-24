const mongoose = require('mongoose');

const convSchema = new mongoose.Schema({
    'senderId': {type: mongoose.Schema.Types.ObjectId, required: true, ref:"User"},
    'receiverId': {type: mongoose.Schema.Types.ObjectId, required: true, ref:"User"},
    // 'sender': {type: Array, default: []},
    // 'receiver': {type: Array, default: []}
});

const Conversation = mongoose.model("conversation", convSchema);

module.exports = Conversation;