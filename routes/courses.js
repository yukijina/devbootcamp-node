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

router
  .route('/')
  .get(advancedResults(Course, { // pass obj to populate
    path: 'bootcamp',
    select: 'name descripion'
  }), getCourses)
  .post(createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse)

module.exports = router;