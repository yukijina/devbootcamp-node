const express = require('express');
const dotenv = require('dotenv');
//const logger = require('./middleware/logger'); -- customer logger without morgan
const morgan = require('morgan')

// Route files                
const bootcamps = require('./routes/routes');

// Load env vars
dotenv.config({ path: './config/config.env'});

const app = express();

 // logger set up is in the middleware
//app.use(logger);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mout routers
app.use('/api/v1/bootcamps', bootcamps);
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is listening in ${process.env.NODE_ENV} mode on port ${PORT}`))
