const UserReact = require('../models/userReact');
const User = require('../models/user');

exports.reactVideo = async (req, res) => {
    const { video } = req.body;
    // console.log("hi");

    try{

        const data ={
            video:video,
            user:req.user.id
        }
        const userReactOnVideo = await UserReact.findOne(data);
        if (userReactOnVideo) {
            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    STATUS: 409,
                    details: {
                        CODE: "You_Have_Already_Reacted_On_This_Video",
                        MESSAGE: "You have already reacted on this video"
                    }
                }
            });
        }
        const userReact = await new UserReact(data).populate('video');
        await userReact.save();
        res.status(201).json({
            success: true,
            data: {
                    userReact
            },
            message: "Successfully Reacted on Video",
        });
    } catch(err) {
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
    try{
        const reactedVideo = await UserReact.findOne({video}).populate([
            { path: "user", select: "name" },
            { path: "video", select: "type , videoUrl" },
        ]);
       // console.log("video",reactedVideo)
        if (!reactedVideo) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    CODE: "BAD_REQUEST",
                    MESSAGE: "Invalid request",
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
                data: {
                    reactedVideo
                },
                message: "React on this Video",
            }
            );
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
