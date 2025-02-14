const VideoReact = require('../models/videoReact');
const Video = require('../models/video');

exports.reactVideo = async (req, res) => {
    const { video } = req.body;
    try {
        const data = {
            video: video,
            user: req.user.id
        }
        let videoExist = await Video.findOne({ _id: video });
        if (!videoExist) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "No video found",
                error: {
                    STATUS: 400,
                    details: {
                        CODE: "NO_VIDEO_FOUND",
                        MESSAGE: "No video found"
                    }
                }
            });
        }
        let videoReact = await VideoReact.findOne(data);
        if (videoReact) {
            videoReact = await VideoReact.deleteOne(data)
            return res.status(200).json({
                success: true,
                message: "Reacted removed from this Video",
            });
        }
        videoReact = await new VideoReact(data).populate('video');
        await videoReact.save();
        res.status(201).json({
            success: true,
            data: {
                videoReact
            },
            message: "Successfully Reacted on Video",
        });
    } catch (err) {
        console.log("error", err)
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

exports.checkReact = async (req, res) => {
    const { video } = req.body;
    try {
        const reactedVideo = await VideoReact.findOne({ video }).populate([
            { path: "user", select: "name" },
            { path: "video", select: "type , videoUrl" },
        ]);
        // console.log("video",reactedVideo)
        if (!reactedVideo) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    STATUS: 400,
                    CODE: "NO_Video_FOUND",
                    MESSAGE: "No video found"

                }
            });
        }
        else {
            res.status(200).send({
                success: true,
                data: {
                    reactedVideo
                },
                message: "React on this Video",
            }
            );
        }
    } catch (err) {
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
