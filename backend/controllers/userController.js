const User = require('../models/user');
const Video = require('../models/video');
const VideoReact = require('../models/videoReact');
const Comment = require('../models/comment');
const Report = require('../models/report');

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secret';

const generateToken = (data) => {
    const dataToSign = {
        email: data?.email,
        name: data?.name,
        id: data?._id,
    }
    return jwt.sign(dataToSign, JWT_SECRET, { expiresIn: '7d' });
};

exports.userSignup = async (req, res) => {
    const { name, userName, email, password } = req.body;
    try {
        // Input validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid request',
                error: {
                    CODE: 'BAD_REQUEST',
                    MESSAGE: 'Invalid request',
                    STATUS: 400,
                    details: {
                        CODE: 'MALFORMED_EMAIL',
                        MESSAGE: 'Email address is invalid'
                    }
                }
            });
        }

        if (typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid request',
                error: {
                    CODE: 'BAD_REQUEST',
                    MESSAGE: 'Invalid request',
                    STATUS: 400,
                    details: {
                        CODE: 'INVALID_PASSWORD_TYPE',
                        MESSAGE: 'Invalid password type'
                    }
                }
            });
        }

        if (typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                success: false,
                data: null,
                message: 'Invalid request',
                error: {
                    CODE: 'BAD_REQUEST',
                    MESSAGE: 'Invalid request',
                    STATUS: 400,
                    details: {
                        CODE: 'INVALID_NAME',
                        MESSAGE: 'Invalid name'
                    }
                }
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(409).json({
                success: false,
                data: null,
                message: "User with this email already exist",
                error: {
                    STATUS: 409,
                    details: {
                        CODE: "USER_WITH_THIS_EMAIL_ALREADY_EXIST",
                        MESSAGE: "User with this email already exist"
                    }
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });

        await newUser.save()
            .then(result => {
                return res.status(201).json({
                    success: true,
                    data: { newUser },
                    message: 'User created successfully',
                });
            });
    } catch (err) {
        console.log("err", err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
};

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Invalid request",
                error: {
                    CODE: "BAD_REQUEST",
                    MESSAGE: "Invalid request",
                    STATUS: 400,
                    details: {
                        CODE: "NO_USER_FOUND",
                        MESSAGE: "no user found"
                    }
                }
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Invalid request",
                error: {
                    CODE: "BAD_REQUEST",
                    MESSAGE: "Invalid request",
                    STATUS: 400,
                    details: {
                        CODE: "INVALID_PASSWORD",
                        MESSAGE: "Invalid password"
                    }
                }
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token: token,
            data: { user },
            message: 'Log in successfully',
        });
    } catch (err) {
        console.log("error", err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
};

exports.getCurrentUserDetails = async (req, res) => {
    try {
        console.log(req.user);
        const user = await User.findOne({ _id: req.user.id });  
        const videos = await Video.find({ user: req.user.id })
        const respData = {
            user,
            videos
        }
        console.log(d);

        res.status(200).json({
            success: true,
            data: { respData },
            message: 'User details',
        });
    } catch (err) {
        console.log("error", err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
}

exports.getAllVideos = async (req, res) => {
    try {

        const videos = await Video.find().populate([
            {
                path: 'user',
                select: '-email -profilePicture -profileUpdated -likes -videos -filePath '
            }
        ]).sort({ uploadedAt: -1 });
        // console.log("videos", videos[0])

        const videosWithReactCounts = await Promise.all(videos.map(async (video) => {
            const reactCount = await VideoReact.find({ video: video._id });
            return {
                ...video.toObject(),
                reactCount: reactCount ? reactCount?.length : 0,
            };
        }));

        res.status(200).json({
            success: true,
            data: { videosWithReactCounts },
            message: 'videos list',
        });
    } catch (err) {
        console.log("error", err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
}

exports.updateUser = async (req, res) => {
    try {
        let body = req.body;
        const userExist = await User.findOne({_id:req.user.id});
        if (userExist?.profileUpdated === false) {
            const fieldsToUpdate = [
                'userName',
                'profileUpdated'
            ]

            if (req.file) {
                const fileName = req.file.filename; // Use the updated filename with timestamp
                const filePath = path.join(__dirname, '../uploads/profilePics', fileName); // Construct the file path
                body.profilePicture = fileName;

                body.filePath = filePath
                if (req?.user?.filePath !== '') {
                    if (fs.existsSync(req?.user?.filePath)) {
                        fs.unlinkSync(req?.user?.filePath);
                    }
                }
            }
            const userUpdate = generateUpdateObject(fieldsToUpdate, body);
            const user = await User.findOneAndUpdate({_id:req.user.id}, userUpdate, { new: true });
            return res.status(200).json({
                success: true,
                data: { user },
                message: 'User Updated Successfully',
            });
        }
    } catch (err) {
        console.log("error", err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
}

const generateUpdateObject = (fieldsArray, dataArray) => {
    const updateObject = {}
    for (let item in fieldsArray) {
        if (dataArray[fieldsArray[item]] !== undefined) {
            updateObject[fieldsArray[item]] = dataArray[fieldsArray[item]]
        }
    }
    return updateObject
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({_id:req.user.id});

        if (!user) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Invalid request",
                error: {
                    CODE: "BAD_REQUEST",
                    MESSAGE: "Invalid request",
                    STATUS: 400,
                    details: {
                        CODE: "NO_USER_FOUND",
                        MESSAGE: "no user found"
                    }
                }
            });
        }

        await Video.deleteMany({ user: req.user.id });
        await VideoReact.deleteMany({ user: req.user.id });
        await Comment.deleteMany({ user: req.user.id });
        await Report.deleteMany({ user: req.user.id });
        // const userExist = await User.fondOne({_id: req.user.id});
        // if (userExist) {
        //     if (req?.user?.filePath !== '') {
        //         if (fs.existsSync(req?.user?.filePath)) {
        //             fs.unlinkSync(req?.user?.filePath);
        //         }
        //     }
        // }
        const data = await User.deleteOne({_id:req.user.id});
        return res.status(200).json({
            success: true,
            data: { data },
            message: 'user deleted successfully',
        });

    } catch (err) {
        console.log("error", err)
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
}
 


// Logout user (optional, if you want to blacklist the token)
exports.userLogout = (req, res) => {
    // you can add the token to the blacklist here
    const token = req.headers.authorization.split(' ')[1];  // Extract token from Authorization header

    // Optional: Blacklist the token (you can implement your own blacklist mechanism)
    // Example: add token to a blacklist in DB or memory
    if (token) {
        // Blacklist the token here (depends on your DB or cache setup)
        // e.g., Redis for storing blacklisted tokens
    }
    return res.status(200).json({
        success: true,
        message: 'User logged out successfully',
    });
};
