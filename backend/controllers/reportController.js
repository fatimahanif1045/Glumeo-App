const Report = require('../models/report');

exports.reportVideo = async (req, res) => {
    const { video, reason } = req.body;
    try {
        const report = new Report({ video, reason });
        await report.save();
        res.status(201).json({
            success: true,
            data: { report },
            message: 'Video reported successfully',
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Invalid request',
            error: { CODE: 'INTERNAL_SERVER_ERROR', MESSAGE: err.message },
        });
    }
};
