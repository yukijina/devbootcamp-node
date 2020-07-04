const express = require('express');
const {
  getCourses, 
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  // getCoursesInRadius  
} = require('../controllers/courses');

// we add object mergeParams in the Router for nested route (bootcamps/:bootcampId/courses)
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getCourses)
  .post(createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse)

module.exports = router;