"use strict";

var User = require(__dirname + '/../model/user');
var jwt = require('jsonwebtoken');
var config = require('../common/config');
var mail = require('../common/mail');

var userApi = {};

/**
 * User Signs up
 */
userApi.signUp = function(req, res, next) {

    var new_user = new User(req.body);
    console.log("Body content: \n");
    console.log("Email:" + req.body.email + "\n");
    console.log("password: " + req.body.password);

    var email = req.body.email;

    User.findOne({
        email: email
    }, function(err, user) {

        if (err) {

            console.log(err);

            return res.status(200).send({
                status: 500,
                message: 'Internal Server Error'
            });
        }

        if (!user) {
            new_user.approved = false;
            new_user.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.status(200).send({
                        status: 500,
                        message: 'Internal Server Error'
                    });
                }

                User.findOne({
                    email: new_user.email
                }, function(err, doc) {

                    if (err) {
                        console.log(err);
                        return res.status(200).send({
                            status: 500,
                            message: 'Internal Server Error'
                        });
                    }

                    var token = jwt.sign(doc, config.secret, {
                        expiresInMinutes: 1440 // expires in 24 hours
                    });

                    var confirmToken = jwt.sign(doc, config.secret, {});


                    // Generate Confirmation Link
                    var confirmationlink = config.serverURL + '/api/web/confirm?token=' + confirmToken;
                    console.log(confirmationlink);
                    // Send Confirmation Email

                    mail.sendTextEmail([new_user.email], 'Please Confirm Your Email', confirmationlink, function(result) {
                            console.log(result);
                        },
                        function(emailErr) {
                            console.log(emailErr);
                        });

                    return res.status(200).send({
                        status: 200,
                        message: 'Successfully registered',
                        api_token: token,
                        user: doc
                    });
                })
            });

        } else {
            return res.status(200).send({
                status: 400,
                message: 'Email address already exists. Try another email address.'
            });
        }
    });

};

/**
 * User Logs in
 */
userApi.logIn = function(req, res, next) {

    var email = req.body.email;
    var password = req.body.password;

    console.log(req.body);

    User.findOne({
        email: email
    }, function(err, user) {

        if (err) {

            console.log(err);

            return res.status(200).send({
                status: 500,
                message: 'Internal Server Error.'
            });
        }

        if (!user) {

            return res.status(200).send({
                status: 401,
                message: 'Missing or invalid authentication credentials.'
            });
        }

        if (!user.authenticate(password)) {

            return res.status(200).send({
                status: 401,
                message: 'Missing or invalid authentication credentials.'
            });
        }

        if (!user.approved) {
            return res.status(200).send({
                status: 401,
                message: 'Email is not verified yet.'
            })
        }

        var token = jwt.sign(user, config.secret, {
            expiresInMinutes: 1440 // expires in 24 hours
        });

        console.log(token);

        return res.status(200).send({
            status: 200,
            message: 'Successfully logged in',
            api_token: token,
            user: user
        });
    });
};

/**
 * Get all users.
 */
userApi.users = function(req, res, next) {

    console.log("get /user");

    var user_id = req.decoded._id;
    var permission = req.decoded.permission;
    if (permission & 0x6 == 0) {
        return res.status(200).send({
            status: 400,
            message: 'Not enough permission'
        });
    }
    User.find({}, null, /*sort*/ {}, function(err, users) {

        if (err) {
            console.log(err);
            return res.status(200).send({
                status: 500,
                message: 'Internal Server Error'
            });
        }

        return res.status(200).send({
            status: 200,
            message: 'Successfully retrieved',
            users: users
        });
    });
};

/**
 * Approve User By Id. Not necessary for v1.0.
 */
userApi.approveUserById = function(req, res, next) {

    var user_id = req.params.id;
    var approved = req.body.approved;
    console.log("PUT /user/:id/approve : " + user_id);

    User.update({
        _id: user_id
    }, {
        $set: {
            approved: approved
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
};

/**
 * Delete User By Id
 */
userApi.deleteUserById = function(req, res, next) {

    var user_id = req.params.id;
    console.log("delete /user/:id : " + user_id);

    User.findOne({
        _id: user_id
    }, function(err, user) {

        if (err) {
            console.log(err);
            return res.status(200).send({
                status: 500,
                message: 'Internal Server Error'
            });
        }

        if (user) {
            user.remove();
        }

        return res.status(200).send({
            status: 200,
            message: 'User deleted successfully.'
        });
    });
};

userApi.sendPasswordResetLink = function(req, res, next) {
    var email = req.params.email || req.query.email || req.body.email;
    if (email) {
        User.findOne({
            email: email
        }, function(err, user) {
            if (err) {

                console.log(err);

                return res.status(200).send({
                    status: 500,
                    message: 'Internal Server Error.'
                });
            }

            if (!user) {

                return res.status(200).send({
                    status: 400,
                    message: 'No user with the email is registered.'
                });
            }

            if (!user.authenticate(password)) {

                return res.status(200).send({
                    status: 401,
                    message: 'Missing or invalid authentication credentials.'
                });
            }

            if (!user.approved) {
                return res.status(200).send({
                    status: 401,
                    message: 'Email is not verified yet.'
                })
            }

            var token = jwt.sign(user, config.secret, {
                expiresInMinutes: 60 // expires in 1 hour
            });

            var resetlink = config.serverURL + '/api/web/resetpassword&token=' + token;
            // Send Email
            mail.sendTextEmail([user.email], 'Please Confirm Your Email', resetlink, function(result) {
                    return res.status(200).send({
                        status: 200,
                        message: 'Email with the reset link will be sent'
                    });
                },
                function(emailErr) {
                    console.log(emailErr);
                    return res.status(200).send({
                        status: 500,
                        message: 'Internal Server Error.'
                    });
                });
        });
    } else {
        return res.status(200).send({
            status: 200,
            message: 'User deleted successfully.'
        });
    }
}

module.exports = userApi;