/**
 * Created by DreamSoft on 7/30/2015.
 */

var expect = require('chai').expect;
var request = require ('supertest');
var app = require('../../../server');
var agent = require('../helpers/agent');

describe('Routes', function(){
    describe('checkin', function(){
        describe('GET /api/checkin/post?username=Denis', function(){
            it('should return 400 with empty username or location', function(done){
                agent
                    .get('/api/checkin/post?username=Denis')
                    .expect('Content-Type', /application\/json/)
                    .expect(400)
                    .end(done);
            });

            it('should return 200 with valid username or location', function(done){
                agent
                    .get('/api/checkin/post?username=Denis&location=Bucharest')
                    .expect('Content-Type', /application\/json/)
                    .expect(200)
                    .end(done);
            });

        });
    });
    describe('checkin', function(){
        describe('GET /api/checkin/post?username=Denis&location=Bucharest', function(){

            it('should return 200 with valid username or location', function(done){
                agent
                    .get('/api/checkin/get?username=Denis&location=Bucharest')
                    .expect('Content-Type', /application\/json/)
                    .expect(200)
                    .end(done);
            });

        });
    });
});