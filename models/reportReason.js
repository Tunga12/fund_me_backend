
const Joi = require('joi');
const mongoose = require('mongoose');

const reportReasonSchema = new mongoose.Schema({
    name:{
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    }
});

const ReportReason = mongoose.model('ReportReason', reportReasonSchema);

function validateReason(rr){
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
    });

    return schema.validate(rr);
}

module.exports.Reason = ReportReason;
module.exports.validate = validateReason;