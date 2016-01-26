// BASE SETUP
// ===============================================================

// =========================
// call the packages we need
// =========================
var express = require('express'); // call express
var app = express();// define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');
var logger = require('./api/common/log');

var jwt = require('jsonwebtoken');
var config = require('./api/common/config');

app.set('superSecret', config.secret);

// parse application/json 
app.use(bodyParser.json());
// Configure app to use bodyParser()
// This will let us get the data from a POST
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// routes
var apiPath = "/api/";
var apiRoutes = require('./api/routes/route');

//---------API Endpoints----------

app.use(apiPath, apiRoutes);

//---------- ----------

app.use(morgan('short', {
    stream: logger.asStream('info')
}));

app.listen(process.env.PORT || 3000);

if (process.env.PORT === undefined) {
    console.log("Server Started at port : " + 3000);
} else {
    console.log("Server Started at port : " + process.env.PORT);
}
