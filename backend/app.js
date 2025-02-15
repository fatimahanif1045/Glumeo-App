const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const multer = require('multer');
const path = require('path');

const videoRoutes = require('./routes/videoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const videoReactRoutes = require('./routes/videoReactRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeCommentRoutes = require('./routes/likeCommentRoutes');
const nearByPlacesRoutes = require('./routes/nearByPlacesRoutes');
///uploads/Glumeo.png
const app = express();
dotenv.config();
//const port = 3000;

const PORT = process.env.PORT || 7000;

connectDB();
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Profile picture upload (Multer storage configuration)
const profilePicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profilePics'); // Destination folder for profile pictures
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Filename with timestamp
  }
});
const profilePicUpload = multer({ storage: profilePicStorage });

// Video upload (Multer storage configuration)
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/video'); // Destination folder for video files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Filename with timestamp
  }
});
const videoUpload = multer({ storage: videoStorage });

// Routes setup
app.use('/api/user', profilePicUpload.single('profilePicture')); // For profile picture upload
app.use('/api/user/videos', videoUpload.single('video')); // For video upload

app.use('/api/user/videos', videoRoutes);
app.use('/api/user/report', reportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/user/videos', videoReactRoutes);
app.use('/api/user/videos', commentRoutes);
app.use('/api/user/videos', likeCommentRoutes);
app.use('/api', nearByPlacesRoutes);

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
