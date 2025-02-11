const mongoose = require('mongoose');

const likeCommentSchema = new mongoose.Schema({
    comment: { type: mongoose.Schema.ObjectId, ref: 'Comment', required: true },
    video: { type: mongoose.Schema.ObjectId, ref: 'Video', required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },

});

module.exports = mongoose.model('LikeComment', likeCommentSchema);
