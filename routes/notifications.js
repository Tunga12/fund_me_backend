const _ = require('lodash');
const express = require('express');
const mongoose = require('mongoose');
const {Notification,validate} = require('../models/notification');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express();
const {viewedNotification} = require('../startup/connection');
// Get all notifications
router.get('/', [auth,admin],async(req,res) => {
    const notifications = await Notification
    .find();

    res.send(notifications);
});

// Get notifications of a user
router.get('/user', auth,async(req,res) => {
    const notifications = await Notification
    .find({recipients:req.user._id, isDeleted: false}).select('-isDeleted');

    res.send(notifications);
});

// Get notification by id
router.get('/:id',auth,async(req,res) => {

	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('Notification with the given ID was not found.');
	}
	
    const notification = await Notification
    .findOne({_id: req.params.id, isDeleted: false})
    .select('-isDeleted')

    if (!notification) return res.status(404).send('Notification with the given ID was not found.');

    res.send(notification);
});


// Get all notifications by a fundraiser
router.get('/fundraiser/:fid', async(req,res) => {
    const notifications = await Notification
    .find({target: req.params.fid, isDeleted: false})
    .select('-isDeleted');

    res.send(notifications);
});



// Post a notification
router.post('/',auth,async(req,res) => {

    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let notification = new Notification(req.body);
    notification = await notification.save();

    res.status(201).send(notification);
});

// Update a notification
router.put('/:id', auth,async(req,res) => {
    // const {error} = validate(req.body);
	// if(error) return res.status(400).send(error.details[0].message);

    // const notification = await Notification.findByIdAndUpdate(req.params.id,req.body,{new: true});

    // if (!notification) return res.status(404).send('Notification with the given ID was not found.');

    // res.send(notification);
    //io.emit('viewed',id);
    const not = await viewedNotification(req.user._id,req.params.id);

    res.send(not);
});


// Delete a notification
router.delete('/:id',auth,async(req, res) => {
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('Notification with the given ID was not found.');
	}
    const notification = await Notification.findByIdAndUpdate(req.params.id,
        {$pull: {recipients: req.user._id, viewed: req.user._id}},{new: true});

    if (!notification) return res.status(404).send('Notification with the given ID was not found.');

    res.send('Notification is deleted');
});

module.exports = router;