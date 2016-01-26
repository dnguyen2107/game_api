"use strict";
var User = require(__dirname + '/../model/user');
var jwt = require('jsonwebtoken');
var config = require('../common/config');
var userApi = require(__dirname + '/user');

var webpages = {}
    /**
     **/
webpages.confirmEmail = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-auth-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                console.log(err);
                return res.status(200).send({
                    status: 401,
                    message: 'Token is invalid.'
                });

            } else {
                // if everything is good, approve the user
                User.findOne({
                    email: decoded.email
                }, function(err, user) {
                    if (err) {
                        console.log(err);
                        return res.status(200).send({
                            status: 500,
                            message: 'Internal Server Error'
                        });
                    }
                    if (user) {
                        // Found the user, validate
                        // Method 1,
                        User.update({
                            _id: user.id
                        }, {
                            $set: {
                                approved: true
                            }
                        }, {
                            upsert: false,
                            runValidators: true
                        }, function(err) {

                            if (err) {
                                console.log(err);

                                return res.status(200).send({
                                    status: 500,
                                    message: 'Internal Server Error'
                                });
                            }

                            return res.status(200).send({
                                status: 200,
                                message: 'Successfully approved'
                            });
                        });
                       
                    }
                });
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(200).send({
            status: 400,
            message: 'Token is not provided.'
        });
    }
}

module.exports = webpages;