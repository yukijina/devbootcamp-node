const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan')
//const logger = require('./middleware/logger'); -- customer logger without morgan
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({ path: './config/config.env'});

//mongoose connect returns promise
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/devcamp', {
  useNewUrlParser: true,
  useCreateIndex: true, 
  useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", () => {
    console.log("> error occurred from the database");
});
db.once("open", () => {
    console.log("> successfully opened the database");
});

// Route files                
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const app = express();

// Body parser - now included in node.js so you don't need to install
app.use(express.json());

 // logger set up is in the middleware
//app.use(logger);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set Public forlder to static folder - image is saved in public folder wwhen uploaded
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

const PORT = process.env.PORT || 5000;

app.use(errorHandler);

app.listen(PORT, console.log(`Server is listening in ${process.env.NODE_ENV} mode on port ${PORT}`))
