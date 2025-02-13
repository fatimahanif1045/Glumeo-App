const User = require('../models/user');
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
                        MESSAGE: "No user found"
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
        const user = await User.findOne({ _id: req.user._id });   //  User.findOne({ email: req.body.email })
        const userVideo = await Video.find({ user: req.user._id }).populate([
            {
                path: 'user',
                select: ' -isDeleted '
            },
            {
                path: 'video',
                select: '-__v' // Adjust fields to exclude as needed
            }
        ]);
        const respData = {
            user,
            userVideo
        }
        return responseSuccess(res, 'User details', respData, null);
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
        const { userId } = req.body
        let body = req.body;
        const userExist = await User.findOne(req.user._id);
        if (userExist?.profileUpdated === false) {
            const fieldsToUpdate = [
                'userName',
                'profileUpdated'
            ]

            if (req.file) {
                const fileName = req.file.filename; // Use the updated filename with timestamp
                const filePath = path.join(PARENT_DIRECTORY, 'uploads/images', fileName); // Construct the file path
                body.profilePicture = fileName;

                body.filePath = filePath
                if (req?.user?.filePath !== '') {
                    if (fs.existsSync(req?.user?.filePath)) {
                        fs.unlinkSync(req?.user?.filePath);
                    }
                }
            }
            const userUpdate = generateUpdateObject(fieldsToUpdate, body);
            const user = await userHelper.updateUserDetailsById(req.user._id, userUpdate, { new: true });
            return responseSuccess(res, 'User Updated Successfully', user, null, null);
        }
        if (userExist?.profileUpdated === true) {
            return responseBadRequest(res, 'user name already changed ', userExist, null, null);
        }
        else {
            return responseBadRequest(res, { message: 'Invalid parameters' });
        }
    } catch (error) {
        if (ERRORS[error.message]) {
            return responseBadRequest(res, ERRORS[error.message].MESSAGE);
        }
        responseServerSideError(res, error.message)
    }
}

// Update requests
userSchema.static('updateUserByUniqueKeys', async function (findQuery, updation) {
    // Cannot allow updation of these keys 	
    const keysToRemove = ['_id', 'email', 'role'];
    removeKeysFromObject(updation, keysToRemove); // Assuming removeKeysFromObject is defined elsewhere

    const user = await this.findOne(findQuery);

    // Update the fields
    Object.assign(user, updation); // Assign the updation to the user object

    const updatedUser = await user.save();

    return options.asResponse
        ? this.findOne(findQuery).select(ADMIN_OBJECT_AS_RESPONSE_PROJECTION_JSON)
        : updatedUser;
});

const generateUpdateObject = (fieldsArray, dataArray) => {
    const updateObject = {}
    for (let item in fieldsArray) {
        if (dataArray[fieldsArray[item]] !== undefined) {
            updateObject[fieldsArray[item]] = dataArray[fieldsArray[item]]
        }
    }
    return updateObject
}


const updateUserDetailsById = (userId, userDetails,) => {
    return User.updateUserByUniqueKeys({ _id: userId }, userDetails,)
}






deleteUser
const deleteUserById = async (req, res) => {
    try {
        const options = { asResponse: true, paginationOptions: { enabled: false }, populate: false };

        await videoHelper.deleteAllVideos({ user: req.user._id });
        await videoReactHelper.deleteAllReact({ user: req.user._id });
        await shareHelper.deleteAllComments({ user: req.user._id });
        await reportHelper.deleteAllReports({ user: req.user._id });
        // const userExist = await userHelper.getUserDetailsById(req.user._id);
        // if (userExist) {
        //     if (req?.user?.filePath !== '') {
        //         if (fs.existsSync(req?.user?.filePath)) {
        //             fs.unlinkSync(req?.user?.filePath);
        //         }
        //     }
        // }

        const dataToUpdate = {
            fcmToken: "",
            isDeleted: true,
            profileUpdated: false,
            videos: 0,
            likes: 0,
            isNewUser: true
        }

        const data = await userHelper.updateUserDetailsById(req.user._id, dataToUpdate);

        // const data = await userHelper.deleteUser(req.user._id);
        return responseSuccess(res, "user deleted successfully", data, null);
    }
    catch (error) {
        if (ERRORS[error.message]) {
            return responseBadRequest(res, ERRORS[error.message].MESSAGE);
        }
        responseServerSideError(res, error.message)
    }
}


const adminDeleteUser = async (req, res) => {
    try {
        const options = { asResponse: true, paginationOptions: { enabled: false }, populate: false };

        await videoHelper.deleteAllVideos({ user: req.body.userId });
        await videoReactHelper.deleteAllReact({ user: req.body.userId });
        await shareHelper.deleteAllShares({ user: req.body.userId });
        await reportHelper.deleteAllReports({ user: req.body.userId });
        await followHelper.deleteALllFollowLocation({ user: req.body.userId });
        await userReportHelper.deleteAllUserReports({ reportUser: req.body.userId })
        // const userExist = await userHelper.getUserDetailsById(req.user._id);
        // if (userExist) {
        //     if (req?.user?.filePath !== '') {
        //         if (fs.existsSync(req?.user?.filePath)) {
        //             fs.unlinkSync(req?.user?.filePath);
        //         }
        //     }
        // }
        const dataToUpdate = {
            fcmToken: "",
            isDeleted: true,
            profileUpdated: false,
            videos: 0,
            likes: 0,
            isNewUser: true
        }

        const data = await userHelper.updateUserDetailsById(req.body.userId, dataToUpdate);
        // const data = await userHelper.deleteUser(req.body.userId);
        // await user_profile_status(data, `Dear ${data?.userName}, \n The video in question was flagged as inappropriate (nudity or privacy related) which goes against the Terms and Conditions.  The RECC Team`)
        await user_profile_status(data, `Dear  ${data?.userName}, \n

Your RECC account was removed due to an infringement of our Terms and Conditions for a RECC submitted by you. \n

The video in question was flagged as *nudity/privacy/ which goes against the Terms and Conditions.`)

        return responseSuccess(res, "user deleted successfully", data, null);
    }
    catch (error) {
        if (ERRORS[error.message]) {
            return responseBadRequest(res, ERRORS[error.message].MESSAGE);
        }
        responseServerSideError(res, error.message)
    }
}
const deleteAllVideos = (videoDetails) => {

    return Video.deleteAllVideos(videoDetails)
}
videoSchema.static('deleteAllVideos', async function (queryString, options = { asResponse: true }) {
    let query = this.deleteMany(queryString).select(options.asResponse ? USER_OBJECT_AS_RESPONSE_PROJECTION_JSON : '')
    return query.exec()
});
const deleteAllReact = (query) => {
    return videoReact.deleteAllReacts(query)
}
videoReactSchema.static('deleteAllReacts', async function (queryString = { asResponse: true }) {
    let query = this.deleteMany(queryString).select(options.asResponse ? USER_OBJECT_AS_RESPONSE_PROJECTION_JSON : '')
    return query.exec()
});

const deleteAllUserReports = (videoDetails) => {

    return ReportUser.deleteAllUserReports(videoDetails)
}

userReportSchema.static('deleteAllUserReports', async function (queryString, options = { asResponse: true }) {
    let query = this.deleteMany(queryString).select(options.asResponse ? USER_OBJECT_AS_RESPONSE_PROJECTION_JSON : '')
    return query.exec()
});

const getVideosByUserId = (query) => {
    let query = Video.find(query).populate([
        {
            path: 'user',
            select: '-fcmToken -email -profilePicture -profileUpdated -likes -videos -filePath -createdAt -updatedAt -role'
        },
        {
            path: 'guestUser',
            select: 'deviceId userName' // Adjust fields to exclude as needed
        }
    ]);

    return query.exec()
}

const getAllVideos = async (req, res) => {
    try {

        const options = { asResponse: true, paginationOptions: { enabled: false }, populate: false };
        const videos = await userHelper.getVideos(options);
        // console.log("videos", videos[0])

        delete videos?.user?.fcmToken
        const videosWithReactCounts = await Promise.all(videos.map(async (video) => {
            const reactCount = await videoReactHelper.getAllReacts({ video: video._id });
            const followCount = await followHelper.getAllFollows({ placeId: video?.placeId });
            // console.log("video?.placeId", followCount)
            const mapCount = await mapHelper.getAllMapByUniqueKeys({ video: video?._id });
            const shareCount = await shareHelper.getSharesByVideoId({ video: video?._id })
            return {
                ...video.toObject(),
                reactCount: reactCount ? reactCount?.length : 0,
                followCount: followCount ? followCount?.length : 0,
                mapCount: mapCount ? mapCount?.length : 0,
                shareCount: shareCount ? shareCount?.length : 0
            };
        }));

        return responseSuccess(res, 'videos list', videosWithReactCounts, null);
    } catch (error) {
        // console.log("Error", error)
        if (ERRORS[error.message]) {
            return responseBadRequest(res, ERRORS[error.message].MESSAGE);
        }
        responseServerSideError(res, error)
    }
}

const getVideos = (options) => {
    let query = Video.find().populate([
        {
            path: 'user',
            select: '-fcmToken -email -profilePicture -profileUpdated -likes -videos -filePath -createdAt -updatedAt -role'
        },
        {
            path: 'guestUser',
            select: 'deviceId userName' // Adjust fields to exclude as needed
        }
    ]).sort({ uploadedAt: -1 });
    return query.exec()
}


const getAllReacts = (query) => {
    let query = videoReact.find(query)
    return query.exec()

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
