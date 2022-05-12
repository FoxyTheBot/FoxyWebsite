const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    _id: String,
    userCreationTimestamp: Date,
    premium: Boolean,
    premiumDate: Date,
    isBanned: Boolean,
    banData: Date,
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