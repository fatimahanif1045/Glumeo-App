const axios = require('axios');

exports.getNearByPlaces= async (req, res) => {
    const {next_page_token} = req.query;
const apiKey= process.env.KEY;
const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${next_page_token}&key=${apiKey}`;

    try {
        console.log(req.query.next_page_token);
        if(!req.query.next_page_token){
            console.log("query 1")
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=27.394369,78.202850&radius=1500&key==${apiKey}`);
            const result = response.data;
            res.status(200).json({
            success: true,
            data: {
                result
            }
        });
        } else {
            console.log("query 2")

            const response = await axios.get(url);
            const result = response.data;
            res.status(200).json({
            success: true,
            data: {
                result
            }
        });
        }      
    }  catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to make request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR ",
                MESSAGE: err.message
            }
        });
    }
};
