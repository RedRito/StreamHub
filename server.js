require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

const port = 3000;

var mongoose = require('mongoose');
var mongoURI = process.env.MONGO_URI;
mongoose.set('useNewUrlParser', true);
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI)

const routes = require('./routes/routes');
routes(app);

app.get('/api', (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});