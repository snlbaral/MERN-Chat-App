const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const Joi = require('joi')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    created_at: {type: Date, default: Date.now },
    addresses: {type: [mongoose.Schema.Types.ObjectId], default: [], ref: "Address"}
});

userSchema.methods.generateToken = function() {
    return jwt.sign({_id: this._id}, 'myPrivateKey');
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = new Joi.object({
        username: Joi.string().required().alphanum().min(3).max(30),
        password: Joi.string().required().regex(/^[a-zA-Z0-9]{3,30}$/),
        email: Joi.string().required().email({ minDomainSegments: 2 }),
        name: Joi.string().required(),
    }).options({ abortEarly: false });
    return schema.validate(user);
}

function validateLogin(user) {
    const schema = new Joi.object({
        username: Joi.string().required().alphanum().min(3).max(30),
        password: Joi.string().required().regex(/^[a-zA-Z0-9]{3,30}$/),
    }).options({ abortEarly: false });
    return schema.validate(user);    
}

async function hashPass(pass) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(pass, salt)
    return hashPassword;
}

module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.hashPass = hashPass;
module.exports.validateLogin = validateLogin;