const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async'); 
const User = require('../models/User');

// @desc  Register user (Signup)
// @route POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Creat user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});


// @desc  Log in user 
// @route POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & Password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400))
  }

  // Check for user
  // include password to validate(default is sae as false by Schema)
  const user = await User.findOne({ email }).select('+password') 
  if (!user) {
    return next(new ErrorResponse('Invalud user', 401))
  }
  // check User model. matchedPassword will reurn promis so we need await
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    return next(new ErrorResponse('Invalud user', 401))
  }
  
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  const options = {
    // calculate 30 days from today 
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true // cookie is only available at client side
  };

  if (process.env.NODE_ENV === 'production') {
    option.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options) // send cookie, you can just use res.cookie
    .json({
      success: true,
      token
    })
    // it's up to client side how to handle cookie
}
