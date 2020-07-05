const express = require('express');
const {
  getCourses, 
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  // getCoursesInRadius  
} = require('../controllers/courses');

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

// we add object mergeParams in the Router for nested route (bootcamps/:bootcampId/courses)
const router = express.Router({ mergeParams: true });

// add protect to the route you want to display only to the current user
const { protect, authorize } = require('../middleware/auth'); 

router
  .route('/')
  .get(advancedResults(Course, { // pass obj to populate
    path: 'bootcamp',
    select: 'name descripion'
  }), getCourses)
  .post(protect, authorize('publisher', 'admin'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router;