const _ = require('lodash');
const express = require('express');
const {Notification,validate} = require('../models/notification');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express();

// Get all notifications
router.get('/', [auth,admin],async(req,res) => {
    const notifications = await Notification
    .find();

    res.send(notifications);
});

// Get notifications of a user
router.get('/user', auth,async(req,res) => {
    const notifications = await Notification
    .find({userIds: {$in:[req.user._id]}, isDeleted: false}).select('-userIds');

    res.send(notifications);
});

// Get notification by id
router.get('/:id',async(req,res) => {
    const notification = await Notification
    .findOne({_id: req.params.id, isDeleted: false})
    .select('-isDeleted')

    if (!notification) return res.status(404).send('Notification with the given ID was not found.');

    res.send(notification);
});


// Get all notifications by a fundraiser
router.get('/fundraiser/:fid', async(req,res) => {
    const notifications = await Notification
    .find({fundraiser: req.params.fid, isDeleted: false})
    .select('-isDeleted');

    res.send(notifications);
});



// Post a notification
router.post('/',auth,async(req,res) => {

    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let notification = new Notification(req.body);
    notification = await notification.save();
    const {sendNotification} = require('../startup/notification');
   // sendNotification(notification);
    res.status(201).send(notification);
});

// Update a notification
router.put('/:id', auth,async(req,res) => {
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    const notification = await Notification.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!notification) return res.status(404).send('Notification with the given ID was not found.');

    res.send(notification);
});

// Delete a notification
router.delete('/:id',auth,async(req, res) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id,
        {$pull: {userIds: { $in: [req.user._id] }}},{new: true});

    if (!notification) return res.status(404).send('A notification with the given ID was not found.');

    res.send('Notification is deleted');
});

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




module.exports = router;