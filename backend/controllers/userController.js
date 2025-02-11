const User = require('../models/user');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secret';

const generateToken = (data) => {
    const dataToSign ={
        email:data?.email,
        name:data?.name,
        id:data?._id,
    }
    return jwt.sign(dataToSign, JWT_SECRET, { expiresIn: '7d' });
  };

exports.userSignup = async (req, res) => {
    const { name, email, password } = req.body;
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
              message:  "User with this email already exist",
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
                        CODE:"INVALID_PASSWORD",
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

// Logout user (optional, if you want to blacklist the token)
exports.logoutUser = (req, res) => {
  // If you're using a blacklist of tokens, you can add the token to the blacklist here
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
