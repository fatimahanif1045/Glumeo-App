require('dotenv').config();
const Comment = require('../models/comment');
const Video = require('../models/video');
const VideoInfo = require('../models/videoInfo');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
//ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);  // Set ffmpeg path from environment variable
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

const generateThumbnail = (videoPath, outputFolder ) => {
    const thumbnailName = `thumbnail-${uuidv4()}.jpg`;  // Generate a unique filename
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: [1],
                filename: thumbnailName,
                folder: outputFolder,
            })
            .on('end', () => {
                console.log('Thumbnail generated successfully.');
                resolve({ thumbnailName });
            })
            .on('error', (err) => {
                console.error('Error generating thumbnail:', err);
                reject(err);
            });
    });
};

const addWatermark = (videoPath, watermarkedVideoPath, watermarkImage ) => {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(watermarkedVideoPath)
            .complexFilter('overlay=30:30')
            .input(watermarkImage)
            .on('end', () => {
                console.log('Watermark added successfully.');
                //fs.unlinkSync(videoPath); 

                resolve({ watermarkedVideoName: path.basename(watermarkedVideoPath) });
            })
            .on('error', (err) => {
                console.error('Error adding watermark:', err);
                reject(err);
            })
            .run();
    });
};

exports.uploadVideo =  async (req, res) => {
    const videoFile = req.file; 
    if (!videoFile) {
        return res.status(400).send('No video file uploaded');
      }
      //const { deviceId = null } = req.body;
      //const userId = req.user?.id || null;

    try {
        const videoName = videoFile.filename;
        const videoPath = path.join(__dirname, '../uploads', 'video' , videoFile.filename);
        const videoExtension = path.extname(videoFile.filename);    // Dynamically get file extension for the output video
        const watermarkedVideoPath = path.join(__dirname, '../uploads', 'watermarked_video' , `${path.basename(videoFile.filename, videoExtension)}.mp4`);
        const watermarkImage = path.join(__dirname, '../uploads' , 'watermark_rec_btn.png');

        if (!fs.existsSync(watermarkImage)) return res.status(400).send('Watermark image not found');

        const outputThumbnailPath = path.join(__dirname, '../uploads', 'thumbnail'); // Define the output folder path for the thumbnails

        // Create the output folder if it doesn't exist
        if (!fs.existsSync(outputThumbnailPath)) {
            fs.mkdirSync(outputThumbnailPath); }
        
        const { thumbnailName }  = await generateThumbnail(videoPath, outputThumbnailPath);
        const { watermarkedVideoName } = await addWatermark(videoPath, watermarkedVideoPath, watermarkImage);

        const newVideo = new Video({ videoName, thumbnailName, watermarkedVideoName, user: req.user.id, deviceId: null });
        await newVideo.save();

        res.status(201).json({
            success: true,
            data: { video:newVideo },
            message: 'Video uploaded successfully',
        });

    } catch (err) {
        console.log("err",err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
};

exports.getVideos = async (req, res) => {
    try{
        const allVideos = await Video.find().sort({date:1});
        if (!allVideos) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    STATUS: 400,
                    details: {
                        CODE: "NO_Video_FOUND",
                        MESSAGE: "No video found"
                    }
                }
            });
        } 
        else {
            res.status(200).send({
                success: true,
                data:{
                    Videos: allVideos,
                }
            });
        }
    } catch(err) {
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        })
    }
};
  
exports.deleteVideo = async (req, res) => {
    const { video } = req.body;
    try{
        const deleteVideo = await Video.findOne({ _id: video }).populate('user');
        if(!deleteVideo){
            return res.status(404).json({
                success: false,
                message: "Invalid request, No video found",
                error: `video with id ${video} not found. No video deleted.`})
        }

        const deleteVideoComment = await Comment.findOne({ video });

        if(deleteVideoComment)
            await Comment.deleteMany({ video });

        if(deleteVideo.user.email === req.user.email){
            await Video.deleteOne({ _id: video });
            res.status(200).json({
                success: true,
                message: "Video deleted successfully",
            });
        }
        else {
            return res.status(401).json({
            success: false,
            message: "Invalid request",
            error: `You are not authorized to perform this action`})
        }

    } catch(err) {
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        })
    }
};


exports.uploadVideoInfo =  async (req, res) => {
    const { type, coordinates, videoUrl, placeName, placeId } = req.body;
    try {
        const newVideo = new VideoInfo({ type, coordinates, videoUrl, placeName, placeId, user: req.user.id });
        await newVideo.save();

      res.status(201).json({
        success: true,
        data: { video:newVideo },
        message: 'Video information uploaded successfully',
    });
         
    } catch (err) {
        console.log("err",err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
};

exports.uploadVideoDeviceId =  async (req, res) => {
    const videoFile = req.file; 
    if (!videoFile) {
        return res.status(400).send('No video file uploaded');
      }
      const { deviceId } = req.body;      
    try {
        const videoName = videoFile.filename;
        const videoPath = path.join(__dirname, '../uploads', 'video' , videoFile.filename);
        const videoExtension = path.extname(videoFile.filename);    // Dynamically get file extension for the output video
        const watermarkedVideoPath = path.join(__dirname, '../uploads', 'watermarked_video' , `${path.basename(videoFile.filename, videoExtension)}.mp4`);
        const watermarkImage = path.join(__dirname, '../uploads' , 'watermark_rec_btn.png');
        
        if (!fs.existsSync(watermarkImage)) return res.status(400).send('Watermark image not found'); 

        const outputThumbnailPath = path.join(__dirname, '../uploads', 'thumbnail'); // Define the output folder path for the thumbnails

        // Create the output folder if it doesn't exist
        if (!fs.existsSync(outputThumbnailPath)) {
        fs.mkdirSync(outputThumbnailPath); }
        
        const { thumbnailName } = await generateThumbnail(videoPath, outputThumbnailPath);
        const { watermarkedVideoName } = await addWatermark(videoPath, watermarkedVideoPath, watermarkImage );

        const newVideo = new Video({ videoName, thumbnailName, watermarkedVideoName, deviceId});
        await newVideo.save();

        res.status(201).json({
            success: true,
            data: { video:newVideo },
            message: 'Video uploaded successfully',
        });

    } catch (err) {
        console.log("err",err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
};