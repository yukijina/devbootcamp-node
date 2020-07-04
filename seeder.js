// insert/seed data to the database without inserting maually
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env'});

// Lode models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// Connect to DV
mongoose.connect('mongodb://localhost:27017/devcamp', {
  useNewUrlParser: true,
  useCreateIndex: true, 
  useUnifiedTopology: true
});

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
)

// Import to our database
const importData = async() => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log('Data imported..')
    process.exit()
  } catch(err) {
    console.error(err);
  }
}

// Delete data
const deleteData = async() => {
  try {
    await Bootcamp.deleteMany(),
    await Course.deleteMany()

    console.log('Data idestroyed..')
    process.exit();
  } catch(err) {
    console.error(err);
  }
}
// node seeder -i
if(process.argv[2] === '-i') {
  importData() 
} else if (process.argv[2] ==='-d') {
  deleteData()
}
// to seed the file run node seeder -i in the termina; (when you want to destroy, node seeder -d) 