const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');

// @desc  GET all courses 
// @route GET /api/courses
// @route GET /api/bootcamps/:bootcapmsId/course
// @access  Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  // in case of route GET /api/bootcamps/:bootcapmsId/course
  if(req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else { //otherwise route GET /api/courses
    query = Course.find()
  }
   const courses = await query;

   res.status(200).json({
     success: true,
     count: courses.length,
     data: courses
   })
}) 
