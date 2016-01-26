/**
 * Created by Andrey Kutkov on 1/13/2016.
 */

var jwt    = require('jsonwebtoken');
var config = require('../common/config');
var User = require(__dirname + '/../model/user');

var tokenAPI = {};

tokenAPI.ensureAdmin = function (req, res, next){

    var id = req.decoded._id || req.body.id || req.query.id;

    User.findOne({_id:id}, function(err, doc) {

        if (err) {
            console.log(err);
            return res.status(200).send({
                status: 500,
                message: 'Internal Server Error'
            });
        }

        if (doc){

            if ((doc.permission &0x6)!=0) {
                next();
            } else {
                return res.status(200).send({
                    status: 401,
                    message: 'You don\'t have admin access.'
                });
            }

        } else {
            return res.status(200).send({
                status: 404,
                message: 'Record not found.'
            });
        }
    });
};

tokenAPI.ensureAuthenticated = function (req, res, next) {
    // check header or url parameters or post parameters for token
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
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
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
};

tokenAPI.ensureUserApproved = function (req, res, next){
    User.findOne({_id: req.decoded._id}, function (err, doc) {

        if (err) {
            console.log(err);
            return res.status(200).send({
                status: 500,
                message: 'Internal Server Error'
            });
        }

        if (doc) {

            console.log(doc.approved);

            if (doc.approved) {

                return next();

            } else {
                return res.status(200).send({
                    status: 401,
                    message: 'Your account is not approved yet.'
                });
            }

        } else {

            return res.status(200).send({
                status: 404,
                message: 'No User Found.'
            });
        }
    })

}

module.exports = tokenAPI;