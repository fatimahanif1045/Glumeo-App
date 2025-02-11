const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoName: { type: String, required: true },
    thumbnailName: { type: String, required: true },
    watermarkedVideoName: { type: String, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    deviceId: { type: String },
    date: { type: Date, default: Date.now },
});

//const Video = mongoose.model('Video', videoSchema); 
module.exports = mongoose.model('Video', videoSchema);
