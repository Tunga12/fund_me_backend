
const Joi = require('joi');
const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        //autopopulate: true
    },
    hasRaised: {
        dollar: {
			type: Number,
			default: 0
		},
		birr: {
			type: Number,
			default: 0
		}
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
        hasRaised: Joi.object(),
        shareCount: Joi.number(),
        isDeleted: Joi.boolean()
    });

    return schema.validate(member);
}

module.exports.teamMemberSchema = teamMemberSchema;
module.exports.TeamMember = TeamMember;
module.exports.validate = validateTeamMember;