/**
** test routes
**/
var request = require('supertest');
var should = require('should');
var assert = require('assert');

describe('Routing', function() {
	var url = 'http://localhost:3000/api'
	before(function() {
    	//create sample data
  	});
 
	after(function() {
	    //clean up sample data
	});

	/**
	User Service Test Suite
	**/
	describe('UserService', function() {
		//login successfully
		it('login should be successful with correct account', function() {
			//this is sample account in local db, make sure you replace it by your own account
			var account = {
				email: 'nguyenhd2109@gmail.com',
				password: 'P@ssword2107',
				token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NmE0ZWIxNjc3ZjdlNjFmMGNjZjcyYjQiLCJlbWFpbCI6Im5ndXllbmhkMjEwOUBnbWFpbC5jb20iLCJoYXNoZWRfcGFzc3dvcmQiOiJiMDY5M2UyMjk3ZjhmNDIzMzYyOWM0OGI0ZWRlOTYzMGE1ZDQwZmE3Iiwic2FsdCI6IjE1MTMzNTIyNjI1MyIsIl9fdiI6MCwiY3JlYXRlZF9hdCI6IjIwMTYtMDEtMjRUMTU6MTM6MjIuNjAxWiIsInVwZGF0ZWRfYXQiOiIyMDE2LTAxLTI0VDE1OjEzOjIyLjYwMVoiLCJhcHByb3ZlZCI6dHJ1ZSwicGVybWlzc2lvbiI6MSwibGFzdF9uYW1lIjoiVGVzdCIsImZpcnN0X25hbWUiOiJUZXN0MSJ9.NGBvjUjpBK4uBVOZPNDaYrndLit2k6H_7i8CADELOi0'
			};
			request(url).post('/users/login').send(account).end(function(err, res) {
	            assert.ifError(err);
	            res.should.have.status(200);
	            res.body.should.have.property('_id');
	            res.body.email.should.equal('nguyenhd2109@gmail.com');
	            res.body.api_token.should.not.equal('Berd');                    
	            res.body.password.should.not.equal(null);
	          	done();
	        });
		});
	});

	/**
	Content Service Test Suite
	**/
	describe('Content Service', function() {
		it('Create content successfully', function() {
			var req_body = {
				file_name: 'my_file.jpg',
				token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NmE0ZWIxNjc3ZjdlNjFmMGNjZjcyYjQiLCJlbWFpbCI6Im5ndXllbmhkMjEwOUBnbWFpbC5jb20iLCJoYXNoZWRfcGFzc3dvcmQiOiJiMDY5M2UyMjk3ZjhmNDIzMzYyOWM0OGI0ZWRlOTYzMGE1ZDQwZmE3Iiwic2FsdCI6IjE1MTMzNTIyNjI1MyIsIl9fdiI6MCwiY3JlYXRlZF9hdCI6IjIwMTYtMDEtMjRUMTU6MTM6MjIuNjAxWiIsInVwZGF0ZWRfYXQiOiIyMDE2LTAxLTI0VDE1OjEzOjIyLjYwMVoiLCJhcHByb3ZlZCI6dHJ1ZSwicGVybWlzc2lvbiI6MSwibGFzdF9uYW1lIjoiVGVzdCIsImZpcnN0X25hbWUiOiJUZXN0MSJ9.NGBvjUjpBK4uBVOZPNDaYrndLit2k6H_7i8CADELOi0'
			};
			request(url).post('/contents').send(req_body).end(function(err, res){
				assert.ifError(err);
				res.should.have.status(200);
	            res.body.should.have.property('_id');
	            res.body.should.have.property('presigned_url');                    
	            res.body.content.should.not.equal(null);
	          	done();
			});
		});
	});
});

