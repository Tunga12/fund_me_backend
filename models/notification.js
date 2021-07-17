
const Joi = require('Joi');
const mongoose = require('mongoose');

const notificationSchema  = new mongoose.Schema({
    userIds: {
        type:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],  
        default: []
    },
    fundraiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fundraiser',
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    content: {
        type: String,
        minlength: 10,
        maxlength: 255,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
    
});

const Notification = mongoose.model('Notification', notificationSchema);

function validateNotification(notification){
    const schema = Joi.object({
        userIds: Joi.array(),
        fundraiser: Joi.objectId().required(),
        type: Joi.string().required(),
        content: Joi.string().min(10).max(255).required(),
        isDeleted: Joi.boolean()
    });

    return schema.validate(notification);
}

module.exports.Notification = Notification;
module.exports.validate = validateNotification;