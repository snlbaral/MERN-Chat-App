const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    'messageBy': {type: mongoose.Schema.Types.ObjectId, required: true},
    'message': {type:String, required: true},
    'conversationId': {type: mongoose.Schema.Types.ObjectId, required: true},
}, {timestamps: true});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;