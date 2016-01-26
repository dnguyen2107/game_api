/**
 * Created by FantDev on 12/7/15.
 */
var mail=require("../common/mail");
var testApi={};
testApi.whatIsDollar = function(req,res,next) {
    mail.sendTextEmail(['andrey.i.kutkov@yandex.com'],'Testing Email','Can you read this?',function(result){
        return res.status(200).send(result);
    },function(error){
        return res.status(200).send(error);
    });
}

module.exports = testApi;