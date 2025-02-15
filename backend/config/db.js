const mongoose = require('mongoose');

//mongodb://a9e5ce7b36baddb4576cc028ccde1b34:asdfgh1234@15a.mongo.evennode.com:27019,15b.mongo.evennode.com:27019/a9e5ce7b36baddb4576cc028ccde1b34?replicaSet=eu-15

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Glumeo');
        console.log('Mongodb Connected!');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
