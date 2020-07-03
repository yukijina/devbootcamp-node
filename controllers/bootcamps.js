const ErrorResponse = require('../util/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async'); // add middleware/healper to avoid repeated try and catch - You can change all try/catch but I leave some of them as is   

// @desc  GET all bootca,ps 
// @route GET /api/bootcamps
// @access  Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find()
    res.status(200).json({ 
      success: true, 
      count: bootcamps.length,
      data: bootcamps
     })
 });

// GET id
exports.getBootcamp = asyncHandler(async (req, res, next) => {
 // try {
    const bootcamp = await Bootcamp.findById(req.params.id)

    // when id format is correct(just typo but when id digits are correct), and if that id is not in the database, it returns success true and data null. To avoid that, we add this if statement. We want to retrun 'false' not 'true' and 'null' 
    if(!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      )
    }
    res.status(200).json({
      success: true,
      data: bootcamp
    })

  //} catch(error) {
    // this returns when id format is incorrect (ex. id is 5 digits but params.id was 6 digits or so)
    // res.status(400).json({ 
    //   success: false, 
    //   msg: error.message 
    // })
  //   next(error);
  // }
})

// Create
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
    
  res.status(201).json({ 
      success: true,
      data: bootcamp
    })
})

// Update
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //we want the new data(updated data)
      runValidators: true  //mongooseValidatprs - validates if the required field are filled out
    });

    if(!bootcamp) {
      return res.status(400).json({
        success: false
      })
    }

    res.status(200).json({ success: true, data: bootcamp })

  } catch(error) {
    next(error)
   }
}

// Delete
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({ success: false, msg: 'No data found'})
    }
    
    res.status(200).json({ success: true, data: {}, msg: `Successfully deleted` })

  } catch (error) {
    next(error)
  }

}