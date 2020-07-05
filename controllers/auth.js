const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async'); 
const sendEmail = require('../util/sendEmail');
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

// @desc  Get current logged in user 
// @route POST /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req ,res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  })
})

// @desc  Forgot password 
// @route POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req ,res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email'),404)
  }

  //Get reset token - we will send user a resetToken but the token saved in db is longer hashed token
  const resetToken = user.getResetPasswordToken();

  await user.save({ vaidateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;

  // You would put a link to frontend (react) - but this API does not offer frontend, just add message here
  const message = `You are receiveing this email because you (0r someone else) has requested the reset of a password. Please make a PUT request to \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });
    
    res.status(200).json({ successs: true, data: 'Email sent' });
  } catch (error) {
    console.log(error);
    // remove token and expire date - do not store in db
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ vaidateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent, 500'));
  }
  
  res.status(200).json({
    success: true,
    data: user
  })
})