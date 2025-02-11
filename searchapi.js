app.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const results = await Content.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error searching content' });
    }
});


//Add an index to searchable fields in MongoDB to improve query performance.
ContentSchema.index({ title: 'text', description: 'text' });
//Pagination and Sorting:

//Include pagination parameters (limit, skip) and sorting (sortBy) for efficient results.

app.get('/search', async (req, res) => {
    const { query, limit = 10, skip = 0, sortBy = 'createdAt' } = req.query;
    try {
        const results = await Content.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
            .limit(Number(limit))
            .skip(Number(skip))
            .sort({ [sortBy]: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error searching content' });
    }
});


app.get('/user/profile/goals-page', async (req, res) => {
    try{
        const pageNo = parseInt(req.query.pageNo) || 1;
        const pageSize = parseInt(req.query.pageSize) || 2;
    
        const startIndex = (pageNo - 1) * pageSize;
        const total = await Goal.countDocuments();
        const goals = await Goal.find().skip(startIndex).limit(pageSize);

        res.status(200).json({
            success: true,
            totalPages: Math.ceil(total / pageSize),
            data: goals
        });
    }  catch (err) {
        console.log("err", err)
        res.status(500).json({
            success: false,
            message: "Invalid request",
            error: {
                CODE: "INTERNAL_SERVER_ERROR",
                MESSAGE: err.message
            }
        });
    }
});