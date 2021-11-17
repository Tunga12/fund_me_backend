
const Joi = require('joi');
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TeamMember',
		required: true,
    
    },
    // added here
    fundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fundraiser',
		required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    tip: {
        type: Number,
        required: true,
    },
	paymentMethod:{
        type: String,
        enum: ['paypal','telebirr'],
		lowercase: true,
        required: true,
    },
    comment: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
	isAnonymous: {
		type: Boolean,
		default: false
	}
});

const PendingDonation = mongoose.model('Pending_Donation', donationSchema);

function validatePaymentRequest(pay){
    const schema = Joi.object({
        returnUrl: Joi.string().required(),
        subject: Joi.string().required(),
        // totalAmount: Joi.number().required(),
        donation: Joi.object({
            userId: Joi.objectId().required(),
            memberId: Joi.objectId().required(),
            fundId: Joi.objectId().required(),
            amount: Joi.number().required(),
            tip: Joi.number().required(),
            paymentMethod: Joi.string().valid('paypal', 'telebirr').required(),
            comment: Joi.string(),
            date: Joi.date(),
            isAnonymous: Joi.boolean(),
        })
    });

    return schema.validate(pay);

}

module.exports.PendingDonation = PendingDonation;
module.exports.validatePayReq = validatePaymentRequest;
