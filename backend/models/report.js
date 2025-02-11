const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    video: { type: mongoose.Schema.ObjectId, ref: 'Video', required: true },
    reason: { type: String, required: true },
});

//const Report = mongoose.model('Report', reportSchema); 

module.exports = mongoose.model('Report', reportSchema);
