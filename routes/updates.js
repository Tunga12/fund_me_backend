const _ = require('lodash');
const express = require('express');
const {Update,validate} = require('../models/update');
const {Fundraiser} = require('../models/fundraiser');
const {Notification} = require('../models/notification');
const {auth} = require('../middleware/auth');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const admin = require('../middleware/admin');
const {newNotification} = require('../startup/connection');
//Fawn.init(mongoose);
const router = express();

// Get all updates of all fundraisers (for admin)
router.get('/', [auth,admin],async(req,res) => {
    const updates = await Update.find()
    .sort('-dateCreated');

    res.send(updates);
});

// Get updates by id
router.get('/:id', async(req, res) => {
    const update = await Update.findOne({_id: req.params.id,isDeleted: false})
    .select('-isDeleted')
   // .populate('fundraiser','title story image organizer')
    .populate('userId', 'firstName lastName email');

    if (!update) return res.status(404).send('An update with the given ID was not found.');

    res.send(update);
});

// Return all updates done by one user
router.get('/member/:uid', async(req,res) => {
    const updates = await Update
    .find({userId: req.params.uid, isDeleted: false})
    .select('-isDeleted');

    res.send(updates);
});

// Post an update
router.post('/:fid', auth,async(req, res) => {
    req.body.userId = req.user._id;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let update = new Update(req.body);
    const id = mongoose.Types.ObjectId(req.params.fid);
    const task = new Fawn.Task();
    try{
        task.save('updates',update)
        .update('fundraisers',{_id:id},{$push: {updates:{$each:[update._id], $sort:-1}}})
        .run();

        res.status(201).send(update);
              
    }catch(e){
        console.log(e.message);
        res.status(500).send('Something went wrong');
    }

        const fund = await Fundraiser.findById(id).populate('donations','userId');
        var recp = [];
        fund.donations.forEach(donation => {
           
			if(recp.length != 0){
			recp.some(function(id){
				if(!id.equals(donation.userId.toString())){
					recp.push(donation.userId);
				}
			});
			}else{
				recp.push(donation.userId);
			}
           
        });
        const newNot = new Notification({
            notificationType:'Update',
            recipients: recp,
            title:`${fund.title}[Update]`,
            content: update.content,
            target: req.params.fid
            
        });

       await newNotification(newNot);
     
});

// Update an update of a fundraiser
router.put('/:id', auth,async(req, res) => {
    req.body.userId = req.user._id;
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message); 

    const update = await Update.findByIdAndUpdate(req.params.id,req.body,{new: true}).select('-isDeleted');

    if (!update) return res.status(404).send('An update with the given ID was not found.');
    
    res.send(update);
});

// Delete an update
router.delete('/:id',auth,async(req, res) => {
    const update = await Update.findById(req.params.id);
    
    if(!update) res.status(404).send('An update with the given ID was not found.');

  //  res.send('Update is deleted');
    const task = new Fawn.Task();
    try{
		task.update('updates',{_id: update._id},{isDeleted: true})
		.update('fundraisers',{updates:update._id},{$pull:{'updates': update._id}})
		.run();

		res.send('Update is deleted')   
	}catch(e){
		res.status(500).send('Something went wrong');
    }
});

module.exports = router;