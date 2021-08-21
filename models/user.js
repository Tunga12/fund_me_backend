
const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    email: {
		type: String,
		minlength: 5,
		maxlength:255,
        required: true,
		unique: true,
	},
	phoneNumber: {
		type: String,
		unique: true,
		minlength: 10,
		//maxlength: 10
	}, 	
	password: {
		type:String,
		required: true,
		minlength: 8,
		maxlength: 1024
	},
    paymentMethods: String,
    emailNotification: {
        type: Boolean,
        default: false
    },
    isDeactivated: {
        type: Boolean,
        default: false
    },
	date: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function(){
	const token = jwt.sign({_id:this._id, isAdmin: this.isAdmin},config.get('jwtPrivateKey'));
	return token;
}

const User = mongoose.model('User',userSchema);

function validateUser(user){
    const schema = Joi.object({
        firstName: Joi.string().min(3).max(50).required(),
        lastName: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
		phoneNumber: Joi.string().min(10),
        password: Joi.string().min(8).max(255).required(),
        paymentMethods: Joi.string(),
        emailNotification: Joi.boolean(),
		date: Joi.date(),
        isDeactivated: Joi.boolean(),
        isAdmin: Joi.boolean(),
        isDeleted: Joi.boolean()

    });

    return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validateUser;