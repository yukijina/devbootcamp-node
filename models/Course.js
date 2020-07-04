const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add tuition']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',  //referencing Bootcamp model
    required: true  // every course needs a bootcamp
  }
  
})

// Static methof to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId}
    },
    {
      $group: {
        _id: '$bootcamp', //we need $sign
        averageCost: { $avg: '$tuition'} //Bootcamp average cost = Couse tuituion's average
      }
    }
  ])
  // when you post a course, returned obj looks like this: 
  //[ { _id: 5d713995b721c3bb38c1f5d0, averageCost: 5000 } ]
  // bootcampId and averageCost (tuition is calcurated with other tuisions and returns average)
  try {
    // obj[0] returns object (removed array bracket)
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10  //give us even number
    })
  } catch (error) {
    console.log(error)
  }
}

// Call getAverageCost after save
CourseSchema.post('save', function() {
  //static so we use constructor
  this.constructor.getAverageCost(this.bootcamp);
})

// Call getAverageCost before remove
CourseSchema.pre('remove', function() {
  this.constructor.getAverageCost(this.bootcamp);
})

module.exports = mongoose.model('Course', CourseSchema);
