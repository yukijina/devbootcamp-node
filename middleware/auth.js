const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../util/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async(req, res, next) => {
  let token;

   // header looks like this:
   // authorization: Bearer gerha359ugaga44809e4tqrqtga(<--token) - so split with space
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  // Make sure toke exists
  if (!token) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //decoded is like this: { id: '5f012ae408bc8e5843a77a12', iat: 1593918811, exp: 1596510811 }

    req.user = await User.findById(decoded.id); // this user is current log in user

    next();    
  } catch (error) {
    return next(new ErrorResponse('Not authorize to access this route', 401));
  }
})

// add this function(protect) to route/bootcamps