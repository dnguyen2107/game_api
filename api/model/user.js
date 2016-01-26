var db = require(__dirname + '/../common/db');
var Schema = db.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
    email: {
        type: String,
        index: true,
        unique: true,
        required: 'Email address is required. '
    },
    first_name: {
        type: String,
        default: ''
    },
    last_name: {
        type: String,
        default: ''
    },
    hashed_password: {
        type: String,
        required: 'Password cannot be blank. '
    },
    salt: {
        type: String
    },

    permission: { // 1: Ordinary User, > 1 Admin
        type: Number,
        min: 1,
        max: 9,
        default: 1
    },
    approved: {
        type: Boolean,
        default: false
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },

    created_at: {
        type: Date,
        default: Date.now()
    }
});


/**
 * Virtuals
 */

UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password
    });

/**
 * Validations
 */

var validatePresenceOf = function(value) {
    return value && value.length
};


// the below 4 validations only apply if you are signing up traditionally

UserSchema.path('email').validate(function(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email); //???
}, 'Please fill a valid email address. ');

UserSchema.path('email').validate(function(email, fn) {
    var User = db.model('users');
    // Check only when it is a new user or when email field is modified
    User.find({
        email: email
    }).exec(function(err, users) {
        //return true;
        fn((!err && users.length === 0));
    });
}, 'Email already exists.');


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
    if (!this.isNew) return next(); //???

    if (!validatePresenceOf(this.password))
        next(new Error('Invalid password'));
    else
        next()
});

/**
 * Methods
 */

UserSchema.methods = {

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainPassword
     * @return {Boolean}
     * @api public
     */

    authenticate: function(plainPassword) {
        return this.encryptPassword(plainPassword) === this.hashed_password
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */

    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + ''
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */

    encryptPassword: function(password) {
        if (!password) return '';
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    }
};


var UserModel = db.model('users', UserSchema);

module.exports = UserModel;