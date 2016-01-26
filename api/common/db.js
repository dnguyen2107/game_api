/**
 * Created by DreamSoft on 7/30/2015.
 */

var mongoose = require('mongoose');
var config = require(__dirname + '/config');
mongoose.connect(config.mongoUri, function(error){
    if(error) return console.log(error);
    console.log("MongoDB: connection to database successful!");
});
module.exports  = mongoose;