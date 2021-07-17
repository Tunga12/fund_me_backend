
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
    amount: {
        type: Number,
        required: true,
        // get: (v) => Math.round(v),
        // set: (v) => Math.round(v)
    },
    comment: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
});

const Donation = mongoose.model('Donation', donationSchema);

function validateDonation(donation){
    const schema = Joi.object({
        userId: Joi.objectId().required(),
        memberId: Joi.objectId().required(),
        amount: Joi.number().required(),
        comment: Joi.string(),
        date: Joi.date(),
        isDeleted: Joi.boolean()
    });

    return schema.validate(donation);
}

module.exports.Donation = Donation;
module.exports.validate = validateDonation;

//User.findByIdAndUpdate(user._id, { $addToSet: { purchasedBookIds: book._id } }).exec();