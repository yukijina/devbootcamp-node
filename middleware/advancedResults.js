// middleware query collection
const advancedResults = (model, populate) => async(req, res, next) => {
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
  query = model.find(JSON.parse(queryStr)); // ex.{averageCost:{"lte":"100000"}}
  
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
  const total = await model.countDocuments(); //Mongoose can count all the documents

  query = query.skip(startIndex).limit(limit);

  //populate course
  if (populate) {
    query = query.populate(populate);
  }
  
  // Execute the query 
  const results = await query;

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
    
  res.advancedResults = { 
    success: true, 
    count: results.length,
    pagination,    // pagination: pagination
    data: results
  }

  next()
};

 module.exports = advancedResults;
