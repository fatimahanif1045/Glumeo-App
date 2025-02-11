const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secret';


function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            data: null,
            message: "Invalid request",
            token: null,
            error: {
                CODE: "CLIENT_UNAUTHORIZED",
                MESSAGE: "You are not authorized to request/modify the resource",
                STATUS: 401,
                details: "Authorization header not found"
            }
        });
    }
    
  const token = authHeader.replace('Bearer ', '');
  try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
    //  console.log("userInfo in authenticateToken", req.user)
      next();
  } catch (err) {
      res.status(401).json({
          success: false,
          data: null,
          message: "Invalid request",
          token: null,
          error: {
              CODE: "CLIENT_UNAUTHORIZED",
              MESSAGE: "You are not authorized to request/modify the resource",
              STATUS: 401,
              details: {
                  name: err.name,
                  message: err.message
              }
          }
      });
  }
}

module.exports = authenticateToken;