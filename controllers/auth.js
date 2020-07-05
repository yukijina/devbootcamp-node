const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async'); 
const User = require('../models/User');

// @desc  Register user (log in)
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

  res.status(200).json({
    success: true
  })
});