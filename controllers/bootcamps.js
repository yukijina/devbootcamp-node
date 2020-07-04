const ErrorResponse = require('../util/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../util/geocoder');
const asyncHandler = require('../middleware/async'); // add middleware/healper to avoid repeated try and catch - You can change all try/catch but I leave some of them as is   

// @desc  GET all bootcamps 
// @route GET /api/bootcamps
// @access  Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // we can access params quary with 'req.query' 
  // ex.api/v1/bootcamps?location=MA => this req.query - { location: 'MA' }
  // ex.api/v1/bootcamps?averageCost[lte]=10000 => this req.query - { averageCost: {lte: '10000} } => $ sign is missing so we need to add
// when we use JSON.stringify(req.query) => return json like this {"averageCost":{"lte":"100000"}}
// Mongo query need $ sigin so we will add by regex

  let query;
  
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude - select is to select column that you want to return (ex SQL.SELECTD name from bootcamp)
  const removeFields = ['select', 'sort', 'page', 'limit'];
  // Loop over removeFields and delete them from reqQery
  removeFields.forEach(param => delete reqQuery[param]);
  
  // Creat query string
  let queryStr = JSON.stringify(reqQuery);   // to JSON ex.{"averageCost":{"lte":"100000"}}
  
  // Create operators ($gt, $gte, $lt, $lte)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  //console.log(JSON.parse(queryStr))  
  
  // Finding resource
  query = Bootcamp.find(JSON.parse(queryStr)); // ex.{averageCost:{"lte":"100000"}}
  
  // Select Fields ex.http://localhost:5000/api/v1/bootcamps?select=name,description
  if (req.query.select) {
    // name,description --> ['name', 'description'] --> 'name description'
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields); //Mongooe query
  }

  // Sort ex.http://localhost:5000/api/v1/bootcamps?select=name,description&sort=name
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    //this is default sort by date (if there is no sort). desceinding order so we put minus -createdAt
    query = query.sort('-createdAt');  
  }

  // Pagination
  // ex. http://localhost:5000/api/v1/bootcamps?select=name&sort=name&page=2
  // If the page number is not specified, defaut number is returned (in this case, display 10)
  // when you add 'page 2', 2nd page (next 10) is returned
  const page = parseInt(req.query.page, 10) || 1; // page 1 is default
  const limit = parseInt(req.query.limit, 10) || 10; //default 10 per page
  const startIndex = (page - 1) * limit; // skip certen number
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments(); //Mongoose can count all the documents

  query = query.skip(startIndex).limit(limit)
  
  // Execute the query 
  const bootcamps = await query;

  // Pagination result - custermize json result. Add previous and next page&limit
  // json result includes data with pagination like this
  // "pagination": {
  //   "next": {
  //       "page": 3,
  //       "limit": 1
  //   },
  //   "prev": {
  //       "page": 1,
  //       "limit": 1
  //   }
  
  
  const pagination = {};

  if(endIndex < total) {
    pagination.next = {  // next is not function but just value
      page: page + 1,
      limit
    }
  }

  if(startIndex > 0) {
    pagination.prev = {
      page:page - 1,
      limit
    }
  }

  // Ony for Get all
  //const bootcamps = await Bootcamp.find()
    
   res.status(200).json({ 
      success: true, 
      count: bootcamps.length,
      pagination,    // pagination: pagination
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

// @desc Get bootcamps within a radius - use geocoder
// @route GET /api/v1/bootcamp/raidius/:zipcode/:distance (distance is miles that users input)
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by raidus of Earth (3963mils / 6378km)
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    // MongoDB query -  $geoWithin
    location: { $geoWithin: { $centerSphere: [[ lng, lat], radius ]}}
  });

  console.log(lng, lat)
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
 });
