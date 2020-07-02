const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env'});

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, conole.log(`Server is listening in ${process.env,NODE_ENV} mode on port ${PORT}`))
