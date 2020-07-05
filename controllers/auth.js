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

  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  })
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
  // Create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token
  })
});
