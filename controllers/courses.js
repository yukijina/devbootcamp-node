const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc  GET all courses 
// @route GET /api/v1/courses
// @route GET /api//v1/bootcamps/:bootcapmsId/course
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  // in case of route GET /api/bootcamps/:bootcapmsId/course
  if(req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else { //otherwise route GET /api/courses
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
  }
   const courses = await query;

   res.status(200).json({
     success: true,
     count: courses.length,
     data: courses
   })
}) 

// @desc  GET a single course 
// @route GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name descroption'
  })

  if(!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
  }
   res.status(200).json({
     success: true,
     data: course
   })
}) 

// @desc  Create a course 
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private (only a login user can do that)
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId; // we will submit bootcampId in the body - bootcamp Model
 console.log(req.body)
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  // if there is no bootcamp, we do not create a course
  if(!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`), 404)
  }

  const course = await Course.create(req.body);

   res.status(200).json({
     success: true,
     data: course
   })
}) 

// @desc  Update a course 
// @route PUT /api/v1/courses/:id
// @access  Private (only a login user can do that)
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if(!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

   res.status(200).json({
     success: true,
     data: course
   })
}) 

// @desc  Delete a course 
// @route DELETE /api/v1/courses/:id
// @access  Private (only a login user can do that)
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if(!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
  }
    // we use .pre middleware to cascade delete so we do not use findByIdAndDelete
   await course.remove();

   res.status(200).json({
     success: true,
     data: {}
   })
}) 


