const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const videoRoutes = require('./routes/videoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const videoReactRoutes = require('./routes/videoReactRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeCommentRoutes = require('./routes/likeCommentRoutes');
const nearByPlacesRoutes = require('./routes/nearByPlacesRoutes');
const multer = require('multer');
const path = require('path');


const app = express();
dotenv.config();
//const port = 3000;

const PORT = process.env.PORT || 7000;

connectDB();
app.use(bodyParser.json());

  // Set up video upload storage configuration
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/video');  // Upload folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//app.use(upload.single('video')) // Process FormData for all routes
app.use('/api/user/videos', upload.single('video')); 

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
