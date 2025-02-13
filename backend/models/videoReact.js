const mongoose = require('mongoose');

const videoReactSchema = new mongoose.Schema({
    video: { type: mongoose.Schema.ObjectId, ref: 'Video', required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },

});

module.exports = mongoose.model('VideoReact', videoReactSchema);
