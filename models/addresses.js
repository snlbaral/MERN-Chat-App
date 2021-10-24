const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
    city: {type: String, required: true},
});

const Address = mongoose.model("Address", addressSchema);

function verifyAddress(addr) {

}

module.exports.Address = Address;
module.exports.verifyAddress = verifyAddress;
