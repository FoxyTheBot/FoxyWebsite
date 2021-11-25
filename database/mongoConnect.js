const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
    _id: String,
    userCreation: Date,
    premium: Boolean,
    isBanned: Boolean,
    banReason: String,
    aboutme: String,
    balance: Number,
    lastDaily: Date,
    marriedWith: String,
    repCount: Number,
    lastRep: Date,
    background: String,
    backgrounds: Array
}, { versionKey: false, id: false });

module.exports = mongoose.model('user', userSchema);