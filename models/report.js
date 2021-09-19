const Joi = require('joi');
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
	fundraiserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fundraiser',
        required: true,
    },
	reason:{
       type: mongoose.Schema.Types.ObjectId,
        ref: 'ReportReason',
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

const Report = mongoose.model('Report', reportSchema);

function validateReport(report){
    const schema = Joi.object({
        userId: Joi.objectId().required(),
		fundraiserId: Joi.objectId().required(),
		reason: Joi.objectId().required(),
		date: Joi.date(),
		isDeleted: Joi.boolean()
    });

    return schema.validate(report);
}

module.exports.Report = Report;
module.exports.validate = validateReport;