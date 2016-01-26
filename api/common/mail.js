var config = require(__dirname + '/config');
var mailjet = require('node-mailjet').connect(config.mailjetPublicKey, config.mailjetPrivateKey);
var mail = {};
mail.mailjet = mailjet;
mail.sendTextEmail = function(recipients, subject, textcontents, onSuccess, onFailure, fromEmail, fromName) {
    if (fromEmail == null) {
        fromEmail = config.mailSenderEmail
    }
    if (fromName == null) {
        fromName = config.mailSenderName
    }
    var sendEmail = mailjet.post('send');
    var recipientEmails = [];
    var i = 0;
    for (i = 0; i < recipients.length; i++) {
        recipientEmails.push({
            'Email': recipients[i]
        });
    }
    var emailData = {
        'FromEmail': fromEmail,
        'FromName': fromName,
        'Subject': subject,
        'Text-part': textcontents,
        'Recipients': recipientEmails
    }
    sendEmail.request(emailData)
        .on('success', function(result) {
            onSuccess(result);
        })
        .on('error', function(error) {
            onFailure(error);
        });
}
module.exports = mail;