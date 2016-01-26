/**
 * Created by FantDev on 1/22/16.
 */

var config = require('../common/config');
var AWS = require('aws-sdk');
//setup AWS configuration
AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
});
var s3 = new AWS.S3();
var Content = require(__dirname + '/../model/content');

var contentApi = {};

contentApi.getContents = function(req, res, next) {
    Content.find({}, function(err, contents) {
        if (err)
            return res.send(err);
        return res.status(200).send({
            status: 200,
            contents: contents,
            message: "Retrieve all content successfully"
        });
    });
};

contentApi.getContentById = function(req, res, next) {
    var contentId = req.params.id;
    console.log("contentId = " + contentId);
    Content.find({
        _id: contentId
    }, function(err, content) {
        if (err) {
            return res.status(200).send({ 
                status: 404,
                 
                message: err
            });
        }
        return res.status(200).send({ 
            status: 200,
             
            content: content,
            message: 'Successfully retrieve content object' 
        });
    });
};

contentApi.createContent = function(req, res, next) {
    var bucket = config.defaultBucket;
    var fileName = req.body.file_name;
    var userID = req.decoded._id;

    var key = userID + '_' + Date.now();
    var params = {
        Bucket: bucket,
        Key: key,
        Expires: 24 * 60 * 60
    };
    s3.getSignedUrl('putObject', params, function(err, url) {
        if (err) {
            return res.status(200).send({ 
                status: 500,
                 
                message: 'Internal Server Error.' 
            });
        } else {
            //save Content object to db
            var newContent = new Content({
                key: key,
                bucket: bucket,
                file_name: fileName,
                presigned_url: url,
                creator: userID
            });
            newContent.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.send(err);
                }
                //return pre-signed url
                return res.status(200).send({
                    status: 200,
                    params: params,
                    content: newContent,
                    presigned_url: url,
                    message: 'Successfully get pre-signed url for putObject'
                });
            });
        }
    })
};

contentApi.updateContentById = function(req, res, next) {
    Content.update({
        _id: req.params.id
    }, {
        $set: req.body
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
            message: 'Successfully update content object'
        });
    });
};

contentApi.deleteContentById = function(req, res, next) {
    var contentId = req.params.id;
    console.log("contentId = " + contentId);
    Content.remove({
        _id: contentId
    }, function(err, content) {
        if (err)
            return res.send(err);
        return res.status(200).send({
            status: 200,
            message: 'Delete content successfully'
        });
    });
}

module.exports = contentApi;