var db = require(__dirname + '/../common/db');
var Schema = db.Schema;

var ContentSchema = new Schema({
    key: {
        type: String,
        index:true,
        unique: true
    },
    bucket: {type: String, default: ''},
    file_name: {type:String, default:''},
    presigned_url: {type: String},
        
    creator: {type: String, default:''},  
    created_at: {
        type: Date,
        default: Date.now()
    }
});


var Content = db.model('content', ContentSchema);

module.exports = Content;