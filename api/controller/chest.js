var config = require('../common/config');
var Chest = require(__dirname + '/../model/chest');
var _ = require('underscore');
var mongoose = require('mongoose');
var chestApi = {};

chestApi.getChests = function(req, res, next) {
    Chest.find({}, function(err, chests) {
        if (err)
            return res.send(err);
        return res.status(200).send({
            status: 200,
            chests: chests,
            message: "Retrieve all chests successfully"
        });
    });
};

chestApi.getChestById = function(req, res, next) {
    //get userId who request this action
    var userId = req.decoded._id;
    var chestId = req.params.id;
    Chest.findOne({
        _id: chestId
    }, function(err, chest) {
        if (err) {
            return res.status(200).send({ 
                status: 505,
                 
                message: "Internal Server Error"
            });
        }
        if (!chest) {
            return res.status(200).send({ 
                status: 404,
                 
                message: "NOT FOUND chestId = " + chestId
            });
        }
        //if this is chest creator
        if (userId === chest.sender.toString()) {
            return res.status(200).send({ 
                status: 200,
                 
                chest: chest,
                message: 'Successfully retrieve chest object' 
            });
        }
        if (chest.send_date && (chest.send_date.getTime() <= Date.now()) && (_.indexOf(chest.recipients, userId) >= 0)) {
            console.log("Recipient and sent immediately");
            console.log("unlock " + chest.unlock_date);
            if (!chest.unlock_date || chest.unlock_date.getTime() <= Date.now()) {
                return res.status(200).send({ 
                    status: 200,
                     
                    chest: chest,
                    message: 'Successfully retrieve chest object' 
                });
            }
            return res.status(200).send({ 
                status: 403,
                message: 'Insufficient Permission' 
            });
        }
        return res.status(200).send({ 
            status: 403,
            message: 'Insufficient Permission' 
        });

    });
};

chestApi.createChest = function(req, res, next) {
    console.dir("Request BoDY: " + req.body);
    var newChest = new Chest(req.body);
    newChest.save(function(err) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        return res.status(200).send({
            status: 200,
            chest: newChest,
            message: 'Successfully save new chest'
        });
    });
};

chestApi.deleteChestById = function(req, res, next) {
    var userId = req.decoded._id;
    var chestId = req.params.id;
    Chest.findOne({
        _id: chestId
    }, function(err, chest) {
        if (err) {
            return res.status(200).send({ 
                status: 505,
                 
                message: "Internal Server Error"
            });
        }
        if (!chest) {
            return res.status(200).send({ 
                status: 404,
                 
                message: "NOT FOUND chestId = " + chestId
            });
        }
        console.log("con1 = " + (userId === chest.sender.toString()));
        console.log("con2 = " + (chest.send_date.getTime > Date.now()));
        //if sender and not sent or sent and this is one of recipient (just chest owner can delete the chest)
        if (((userId === chest.sender.toString()) && (chest.send_date.getTime() > Date.now())) || ((chest.send_date.getTime() < Date.now()) && (_.indexOf(chest.recipients, userId) >= 0))) {
            Chest.remove({
                _id: req.params.id
            }, function(err, chest) {
                if (err)
                    return res.send(err);
                return res.status(200).send({
                    status: 200,
                    message: 'Delete chest successfully'
                });
            });
        } else {
            return res.status(200).send({
                status: 403,
                message: 'Insuffcient Permission'
            });
        }
    });

};

chestApi.updateChestById = function(req, res, next) {
    var userId = req.decoded._id;
    var chestId = req.params.id;
    Chest.findOne({
        _id: chestId
    }, function(err, chest) {
        if (err) {
            return res.status(200).send({ 
                status: 505,
                 
                message: "Internal Server Error"
            });
        }
        if (!chest) {
            return res.status(200).send({ 
                status: 404,
                 
                message: "NOT FOUND chestId = " + chestId
            });
        }
        //if this is chest creator and send_date is in future --> can update this chest
        if (userId === chest.sender.toString() && chest.send_date.getTime() > Date.now()) {
            Chest.update({
                _id: req.params.id
            }, {
                $set: req.body
            }, {
                upsert: false,
                runValidators: true
            }, function(err) {
                if (err) {
                    return res.status(200).send({
                        status: 500,
                        message: 'Internal Server Error'
                    });
                }
                return res.status(200).send({
                    status: 200,
                    message: 'Successfully update chest object'
                });
            });
        } else {
            return res.status(200).send({
                status: 403,
                message: 'Insuffcient Permission'
            });
        }
    });
};

/**
 ** get all chests that this user sent or received
 **/
chestApi.getChestsForUser = function(req, res, next) {
    var userId = req.decoded._id;
    //find list of chests this user sent
    Chest.find({
        sender: mongoose.Types.ObjectId(userId)
    }, function(err, sentChests) {
        if (err) {
            return res.status(200).send({ 
                status: 505,
                 
                message: "Internal Server Error" + err
            });
        }
        //find list of chests this user received
        Chest.find({
            recipients: userId
        }, function(err, receivedChests) {
            if (err) {
                return res.status(200).send({ 
                    status: 505,
                     
                    message: "Internal Server Error" + err
                });

            }
            var finalChests = sentChests.concat(receivedChests);
            return res.status(200).send({ 
                status: 200,
                 
                chests: finalChests,
                message: "Get all chests for userId = " + userId
            });
        });
    });
};

/**
Send chest:
1. immediately if send_date is null
2. schedule send if send_date is not null
**/
chestApi.sendChest = function(req, res, next) {
    var sendDate = req.body.send_date ? req.body.send_date : Date.now();
    var chestId = req.body.chest_id;
    var recipients = req.body.recipients;
    //retrieve Chest
    Chest.find({
        _id: chestId
    }, function(err, chest) {
        if (err) {
            return res.status(200).send({ 
                status: 505,
                 
                message: "Internal Server Error" + err
            });
        }
        if (!chest) {
            if (err) {
                return res.status(200).send({ 
                    status: 404,
                     
                    message: "NOT FOUND chestId = " + chestId
                });
            }
        }
        if (recipients) {
            Chest.update({
                _id: chestId
            }, {
                $set: {
                    send_date: sendDate,
                    recipients: recipients
                }
            }, {
                upsert: false,
                runValidators: true
            }, function(err) {
                if (err) {
                    return res.status(200).send({
                        status: 500,
                        message: 'Internal Server Error'
                    });
                }
                return res.status(200).send({ 
                    status: 200,
                     
                    message: "Chest sent successfully"
                });
            });
        } else {
            Chest.update({
                _id: chestId
            }, {
                $set: {
                    send_date: sendDate
                }
            }, {
                upsert: false,
                runValidators: true
            }, function(err) {
                if (err) {
                    return res.status(200).send({
                        status: 500,
                        message: 'Internal Server Error'
                    });
                }
                return res.status(200).send({ 
                    status: 200,
                     
                    message: "Chest sent successfully"
                });
            });
        }
    });
};
/**
 ** add single content to this chest
 **/
chestApi.addContent = function(req, res, next) {
    var chestId = req.body.chest_id;
    Chest.findOne({
        _id: chestId
    }, function(err, chest) {
        if (err) {
            return res.status(200).send({
                status: 500,
                message: 'Internal Server Error'
            });
        }
        if (!chest) {
            return res.status(200).send({
                status: 404,
                message: 'NOT FOUND chestId = ' + chestId
            });
        }
        //if chestId found in db, add new content to elements[]
        var newEl = {
            content: req.body.content_id,
            information: req.body.information
        };
        chest.elements.push(newEl);
        chest.save(function(err) {
            if (err) {
                return res.status(200).send({
                    status: 500,
                    message: 'Internal Server Error'
                });
            }
            return res.status(200).send({
                status: 200,
                message: 'New content added successfully'
            });
        });
    });
};

module.exports = chestApi;