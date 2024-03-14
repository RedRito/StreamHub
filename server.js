require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const cron = require("node-cron");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
const port = 3000;

var mongoose = require('mongoose');
var mongoURI = process.env.MONGO_URI;

//first load schemas
Creator = require('./models/creator');

mongoose.Promise = global.Promise;
mongoose.connect(mongoURI)

const routes = require('./routes/routes');
routes(app);

var test = require("./streamScraper/automatedScrape");

test.automateScrape();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

