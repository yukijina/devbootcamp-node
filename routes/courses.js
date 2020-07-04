const express = require('express');
const {
  getCourses 
  // getCourse,
  // createCourses,
  // updateCourses,
  // deleteCourses,
  // getCoursesInRadius  
} = require('../controllers/courses');

// we add object mergeParams in the Router for nested route (bootcamps/:bootcampId/courses)
const router = express.Router({ mergeParams: true });


router.route('/').get(getCourses);

module.exports = router;