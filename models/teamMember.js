
const Joi = require('Joi');
const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        //autopopulate: true
    },
    hasRaised: {
        type: Number,
        default: 0,
    },
    shareCount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

function validateTeamMember(member){
    const schema = Joi.object({
        userId: Joi.objectId().required(),
        hasRaised: Joi.number(),
        shareCount: Joi.number(),
        isDeleted: Joi.boolean()
    });

    return schema.validate(member);
}

module.exports.TeamMember = TeamMember;
module.exports.validate = validateTeamMember;