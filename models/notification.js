
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
       // required: true,
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
       // target: Joi.objectId().required(),
        notificationType: Joi.string().required(),
        title: Joi.string().required(),
        content: Joi.string().min(10).max(255).required(),
        viewed: Joi.array(),
        isDeleted: Joi.boolean()
    });

    return schema.validate(notification);
}

async function createNotification(notification) {
    // const { error } = validateSysNotification(notification);
    // if (error) return res.status(400).send(error.details[0].message);

    const newNotification = new Notification({
        notificationType: notification.notificationType,
        recipients: notification.recipients,
        title: notification.title,
        content: notification.content,
        target: notification.target,
    });
    await newNotification.save();

    return newNotification;
    // res.send(newNotification);
}

async function numOfUnreadNotification(userId){

    const count = await Notification.countDocuments({
        recipients: userId,
        viewed: { "$ne": userId}

    });

    return count;
}

async function markAsViewed(notificationId, userId){
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { $push: { viewed: userId } },
        { new: true }
    );

    return notification;
 }

 module.exports = {
     Notification: Notification,
     validate: validateNotification,
     createNotification: createNotification,
     numOfUnreadNotification: numOfUnreadNotification,
     markAsViewed: markAsViewed 

 }

module.exports.Notification = Notification;
module.exports.validate = validateNotification;