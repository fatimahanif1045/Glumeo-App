const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String }, 
    filePath: { type: String, default: "" },
    videos:{ type:String, default:'0' },
    likes:{ type:Number, default:0 },
    Comments:{ type:Number, default:0 },
    profileUpdated:{
        type:Boolean,
        enum:[true, false],
        default:false
    },
},
{ timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
