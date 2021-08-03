
const Joi = require('joi');
const mongoose = require("mongoose");
const {teamMemberSchema} = require("./teamMember");
const fundraiserSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
    },
    image: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
              const urlPattern = /(http|https):\/\/(\w+:{0,1}\w*#)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%#!\-/]))?/;
              const urlRegExp = new RegExp(urlPattern);
              return value.match(urlRegExp);
            },
            message: props => `${props.value} is not a valid URL`
          }
    },
    goalAmount: {
        type: Number,
        required: true
    },
    story: {
        type: String,
        minlength: 10,
        maxlength: 255,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
       // autopopulate: {"select" : "name", maxDepth: 1}
    },
    location: {
        latitude: {
            type: String,
            required: true,
        },
        longitude: {
            type: String,
            required: true,
        }  
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
	withdraw: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Withdraw',
    },
    donations: {
        type:[{type: mongoose.Schema.Types.ObjectId, ref: 'Donation'}],  //Change later
        default: []
    },
    updates: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Update'}],
        default: []
    },
    teams: {
        type: [{
			id:{ type:mongoose.Schema.Types.ObjectId, ref: 'TeamMember',required:true},
			userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true},
			status: {
				type:String,
				default: 'pending'
			},
		}],
        default: []
    },
    totalRaised: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    totalShareCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
	likedBy: {
		type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        default: []
	},
    isDeleted: {
        type: Boolean,
        default: false,
    },
});




//fundraiserSchema.plugin(require('mongoose-autopopulate'));
fundraiserSchema.plugin(require('mongoose-paginate-v2'));
fundraiserSchema.plugin(require('mongoose-aggregate-paginate-v2'));

const Fundraiser = mongoose.model('Fundraiser', fundraiserSchema);

function validateFundraiser(fundraiser){
    const schema = Joi.object({
        title: Joi.string().min(5).max(50).required(),
        image: Joi.string().required(),
        goalAmount: Joi.number().required(),
        story: Joi.string().min(10).max(255).required(),
        category: Joi.objectId().required(),
        location: Joi.object().required(),
        dateCreated: Joi.date(),
        organizer: Joi.objectId().required(),
		withdraw: Joi.objectId(),
        donations: Joi.array(),
        updates: Joi.array(),
        teams: Joi.array(),
        totalRaised: Joi.number(),
        isPublished: Joi.boolean(),
        totalShareCount: Joi.number(),
        likeCount: Joi.number(),
		likedBy: Joi.array(),
        isDeleted: Joi.boolean(),
    });

    return schema.validate(fundraiser);
}

function getPagination (page, size)  {
    const limit = size ? +size : 30;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
};

module.exports.Fundraiser = Fundraiser;
module.exports.validate = validateFundraiser;
module.exports.getPagination = getPagination;

