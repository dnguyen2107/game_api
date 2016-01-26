"use strict";

var User = require(__dirname + '/../model/user');
var promise = require("q");
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../common/config');

var token = require('../controller/token');
var user = require('../controller/user');
var test = require('../controller/test');
var webpages = require('../controller/web');
var content = require('../controller/content');
var chest = require('../controller/chest');
// =======================
// Test APIs
// =======================
router.get('/test/whatisdollar', test.whatIsDollar);
// =======================
// User Management APIs
// =======================
/*
 http://localhost:3000/api/user/signup [POST]
 */
router.post('/user/signup', user.signUp);

/*
 http://localhost:3000/api/user/login [POST]
 */
router.post('/user/login', user.logIn);

/*
 http://localhost:3000/api/user/ [GET]
 */
router.get('/user/', token.ensureAuthenticated, token.ensureUserApproved, token.ensureAdmin, user.users);

/*
 http://localhost:3000/api/user/{user_id} [DELETE]
 */
router.delete('/user/:id', token.ensureAuthenticated, token.ensureUserApproved, token.ensureAdmin, user.deleteUserById);

/*
 http://localhost:3000/api/{user_id}/approve [PUT]
 */
router.put('/user/:id/approve', token.ensureAuthenticated, token.ensureAdmin, user.approveUserById);

/*
 http://localhost:3000/api/user/login [POST]
 email : email address
 */
router.post('/user/resetpassword', user.sendPasswordResetLink);
/*
 http://localhost:3000/api/web/confirm?token={validation_token} [GET]
 */
router.get('/web/confirm', webpages.confirmEmail);


// =======================
// Content APIs
// =======================
/*
 http://localhost:3000/api/contents[POST]
 * body params = file_name
 */
router.post('/contents', token.ensureAuthenticated, content.createContent);
/*
 http://localhost:3000/api/contents [GET]
 */
router.get('/contents', token.ensureAuthenticated, token.ensureAdmin, content.getContents);

/*
 http://localhost:3000/api/contents/{content_id} [GET]
 */
router.get('/contents/:id', token.ensureAuthenticated, content.getContentById);

/*
 http://localhost:3000/api/contents/{content_id} [PUT]
 */
router.put('/contents/:id', token.ensureAuthenticated, content.updateContentById);
/*
 http://localhost:3000/api/contents/{content_id} [DELETE]
 */
router.delete('/contents/:id', token.ensureAuthenticated, content.deleteContentById);


// =======================
// Chest APIs
// =======================
/*
 http://localhost:3000/api/chests [POST]
 */
router.post('/chests', token.ensureAuthenticated, chest.createChest);
/*
 http://localhost:3000/api/chests [GET]
 */
router.get('/chests', token.ensureAuthenticated, token.ensureAdmin, chest.getChests);

/*
http://localhost:3000/api/chests/getchestsforuser [GET]
*/
router.get('/chests/getchestsforuser', token.ensureAuthenticated, chest.getChestsForUser);

/*
 http://localhost:3000/api/chests/{chest_id} [GET]
 */
router.get('/chests/:id', token.ensureAuthenticated, chest.getChestById);

/*
 http://localhost:3000/api/chests/{chest_id} [PUT]
 */
router.put('/chests/:id', token.ensureAuthenticated, chest.updateChestById);
/*
 http://localhost:3000/api/chests/{chest_id} [DELETE]
 */
router.delete('/chests/:id', token.ensureAuthenticated, chest.deleteChestById);

/*
 http://localhost:3000/api/chests/sendChest [POST]
 */
router.post('/chests/sendchest', token.ensureAuthenticated, chest.sendChest);

/*
 http://localhost:3000/api/chests/addcontentPOST]
 */
router.post('/chests/addcontent', token.ensureAuthenticated, chest.addContent);
module.exports = router;