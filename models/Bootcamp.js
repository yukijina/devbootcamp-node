const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../util/geocoder');

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,  'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  slug: String, // need to install npm i slugify
  description: {
    type: String,
    required: [true,  'Please add a description'],
    maxlength: [500, 'Name can not be more than 500 characters']
  },
  website: {
    type: String,
    //has to be this form
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, ' Phone number can not be longer than 20 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please use a valid email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    //GeoJson Point - details check GEOJson
    type: {
      type: String, 
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String, 
    street: String,
    city: String,
    state: String,
    zipcode: String, 
    country: String
  },
  careers: {
    // Array of strings
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  avarageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Ratinf must not be more than 10']
  },
  averageCost: Number,
  photo: {
    // database will be the name of the file (not the actual image is storef.)
    type: String,
    // If there is no photo, you can create default avatar and display that photo in frontend
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    defaault: false
  },
  createAt: {
    type: Date,
    //current date time
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',  //referencing User model
    required: true  // every bootcamp needs a user
  }

}, {
  // set virtuals (display courses in the bootcamp)
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create bootcamp slug from the name
// we use function (not allow fn) "this" will be different if we use allow
BootcampSchema.pre('save', function(next){
  //console.log('Slugify ran', this.name);  // this.name is new data's name (Schema's name field)
  //in this case, we apply name to slug
  this.slug = slugify(this.name, { lower: true });
  next();
})

// Geocoder & create location filed
BootcampSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.address);
  this.location ={
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save address in DB (because we save formatted address)
  this.address = undefined;
  next();
})


// Cascade delete courses when a bootcamp is delated - use pre mongoose middleware
BootcampSchema.pre('remove', async function(next) {
  await this.model('Course').deleteMany({ bootcamp: this._id}); //delete couses that bootcamp id is _id
  next();
})
// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',  //reference model
  localField: '_id',
  foreignField: 'bootcamp', //Field in Couse model's bootcamp reference
  justOne: false // false - populate virtuals in an array
})


module.exports = mongoose.model('Bootcamp', BootcampSchema);