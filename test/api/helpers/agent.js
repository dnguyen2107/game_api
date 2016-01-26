/**
 * Created by DreamSoft on 7/30/2015.
 */
var request = require('supertest');
var app = require('../../../server');

if(process.env.API_ENV === 'stage'){
    var agent = request ('https://your_server');
}
else{
    var agent = request.agent(app);
}

module.exports = agent;