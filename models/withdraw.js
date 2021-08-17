const Joi = require('joi');
const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
	bankName: {
		type: String,
		required: true
	},
	bankAccountNo: {
		type: String,
		unique:true,
		required: true
	},
	beneficiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
	isOrganizer: {
		type: Boolean,
		required: true
	},
	status: {
		type: String,
		default: 'pending'
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
withdrawSchema.plugin(require('mongoose-paginate-v2'));
const Withdraw = mongoose.model('Withdraw',withdrawSchema);

function validateWithdraw(withdraw){
    const schema = Joi.object({
        bankName: Joi.string().required(),
        bankAccountNo: Joi.string().required(),
        beneficiary: Joi.objectId().required(),
		isOrganizer: Joi.boolean().required(),
		status: Joi.string(),
		date: Joi.date(),
        isDeleted: Joi.boolean()

    });

    return schema.validate(withdraw);
}

function getPagination (page, size)  {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
};

module.exports.Withdraw = Withdraw;
module.exports.validate = validateWithdraw;
module.exports.getPagination = getPagination;