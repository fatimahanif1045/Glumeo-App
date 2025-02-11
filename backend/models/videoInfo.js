const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    type: { type: String },
    coordinates: { type: [Number] },
    videoUrl: { type: String, required: true },
    placeName: { type: String },
    placeId: { type: String },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
   date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VideoInfo', videoSchema);
