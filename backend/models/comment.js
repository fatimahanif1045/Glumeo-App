const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment: { type: String,  required: true },
    video: { type: mongoose.Schema.ObjectId, ref: 'Video', required: true },
    likeComment: [{ type: mongoose.Schema.ObjectId, ref: 'LikeComment' }],
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Comment', commentSchema);
