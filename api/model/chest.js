var mongoose = require('mongoose');
var db = require(__dirname + '/../common/db');
var Schema = db.Schema;

var ChestSchema = new Schema({
    recipients: [],
    sender: {type: Schema.Types.ObjectId, ref: 'UserModel'},
    elements: [
        {
            //content: {type: Schema.Types.ObjectId, ref: 'Content'},
            content: {type: String, default: ''},
            information: {type: String, default: ''}
        }
    ],
    unlock_date: {type: Date},
    send_date: {type: Date},    
    // status={created, scheduled, sent/received, opened, unlocked}
    status: {type: String, default: ''},  
    created_at: {
        type: Date,
        default: Date.now()
    }
});

var Chest = db.model('chest', ChestSchema);

module.exports = Chest;