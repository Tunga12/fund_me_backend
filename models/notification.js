
const Joi = require('joi');
const mongoose = require('mongoose');

const notificationSchema  = new mongoose.Schema({
    recipients: {
        type:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],  
        default: []
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fundraiser',
        required: true,
    },
    notificationType: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        minlength: 10,
        maxlength: 255,
        required: true
    },
    viewed: {
        type:[{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],  
        default: []
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
    
});

const Notification = mongoose.model('Notification', notificationSchema);

function validateNotification(notification){
    const schema = Joi.object({
        recipients: Joi.array(),
        target: Joi.objectId().required(),
        notificationType: Joi.string().required(),
        title: Joi.string().required(),
        content: Joi.string().min(10).max(255).required(),
        viewed: Joi.array(),
        isDeleted: Joi.boolean()
    });

    return schema.validate(notification);
}

module.exports.Notification = Notification;
module.exports.validate = validateNotification;