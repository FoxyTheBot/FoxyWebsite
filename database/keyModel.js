const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const keySchema = new mongoose.Schema({
    _id: String,
    key: String
}, { versionKey: false, id: false });

module.exports = mongoose.model('key', keySchema);