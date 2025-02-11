const LikeComment = require('../models/likeComment');
const handleErrorResponse = require('../utils/handleErrorResponse'); 

exports.likeCommentVideo = async (req, res) => {
    const { comment, video } = req.body;

     // Validate input
     if (!comment || !video) {
        return handleErrorResponse(res, "Comment and video ID are required", 400, "Missing required fields");
    }

    try{
        const data ={
            comment: comment,
            video:video,
            user:req.user.id
        }

        const likeComment = await LikeComment.findOne({$and: [{ user:data.user },{video:video},{comment: comment}]}).populate('comment');
        
        if(!likeComment){
            const likeCommentVideo = await new LikeComment(data).populate('comment');
            await likeCommentVideo.save();
            res.status(201).json({
                success: true,
                data: {
                    likeCommentVideo
                },
                message: "Successfully like the Comment",
            });
        } else {
                await LikeComment.deleteOne({$and: [{ user:data.user },{video:video},{comment: comment}]});
                res.status(200).json({
                    success: true,
                    message: " Comment unliked",
                });           
        }
        
    } catch (err) {
        console.error("Error liking comment:", err);
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        });
    }
};
