
const Joi = require('joi');
const mongoose = require('mongoose');

const helpSchema = new mongoose.Schema({
    title:{
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    },
	content:{
        type: String,
        minlength: 10,
        required: true
    },
	category:{
        type: String,
        enum: ['Getting started','Account management','Money management','Donor questions','Common issues','Saftey & security'],
        required: true,
    },
	date: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const Help = mongoose.model('Help', helpSchema);

function validateHelp(help){
    const schema = Joi.object({
        title: Joi.string().min(3).max(255).required(),
		content: Joi.string().min(10).required(),
		category: Joi.string().required(),
		date: Joi.date(),
		isDeleted: Joi.boolean()
    });

    return schema.validate(help);
}

module.exports.Help = Help;
module.exports.validate = validateHelp;