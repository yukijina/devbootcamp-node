const ErrorResponse = require('../util/errorResponse');

// it is middleware so you need to set app.use in server.js
const errorHandler = (err, req, res, next) => {
  // we create our own custom code so we assign incoming err to error
  let error = {...err};

  error.message = err.message;

  console.log(err)

  // Mongoose bad Object Id
  // you can see err.name by console.log(err)
  if (err.name === 'CastError') {
    const message = `Bootcamp not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404)
  }

  // Mongoose duplicate Key (id difits were correct but incorrect id number/not found in database)
  if(err.code === 11000) {
    const message = 'Duplicate filed value'
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error (when name or those input was missing)
  if(err.name === 'ValidationError') {
    const message =  Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    errorMessage: error.message || 'Server Error'
  })
}

module.exports = errorHandler;