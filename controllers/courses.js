const ErrorResponse = require('../util/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc  GET all courses 
// @route GET /api/v1/courses
// @route GET /api//v1/bootcamps/:bootcapmsId/course
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  //let query;
  // in case of route GET /api/bootcamps/:bootcapmsId/course
  if(req.params.bootcampId) {
    query = await Course.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  } else { 
    res.status(200).json(res.advancedResults);
  }
}) 

// @desc  GET a single course 
// @route GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
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
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  // if there is no bootcamp, we do not create a course
  if(!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`), 404)
  }

  // Make sure user is bootcamp owner
   if (bootcamp.uer.toString() !== req.user.id && req.user.role != 'admmn') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add a course to this bootcamp ${bootcamp._id}`, 401)
    )
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

  // Make sure user is bootcamp owner
  if (course.uer.toString() !== req.user.id && req.user.role != 'admmn') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update a course ${course._id}`, 401)
    )
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

  // Make sure user is bootcamp owner
  if (course.uer.toString() !== req.user.id && req.user.role != 'admmn') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete a course ${course._id}`, 401)
    )
  }
    
    // we use .pre middleware to cascade delete so we do not use findByIdAndDelete
   await course.remove();

   res.status(200).json({
     success: true,
     data: {}
   })
}) 


