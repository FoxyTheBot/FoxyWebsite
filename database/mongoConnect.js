const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    _id: String,
    coins: Number,
    lastDaily: String,
    reps: Number,
    lastRep: String,
    backgrounds: Array,
    background: String,
    aboutme: String,
    marry: String,
    premium: Boolean,
});

module.exports = mongoose.model('user', userSchema);