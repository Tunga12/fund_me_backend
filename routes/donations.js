const _ = require('lodash');
const express = require('express');
const {Donation,validate} = require('../models/donation');
const auth = require('../middleware/auth');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const admin = require('../middleware/admin');

const router = express();

// Get all donations (for admin)
router.get('/', [auth,admin],async(req,res) => {
    const donations = await Donation.find()
    .sort('-date');
    //.populate('fundraiser','title story image organizer');

    res.send(donations);
});

// Get donation by id
router.get('/:id', async(req, res) => {
    const donation = await Donation.findOne({_id: req.params.id,isDeleted: false})
    .select('-isDeleted')
    .populate('userId','firstName lastName email');

    if (!donation) return res.status(404).send('Donation with the given ID was not found.');

    res.send(donation);
});

//Get donations by memberId
router.get('/member/:uid', async(req, res) => {
    const donations = await Donation.find({memberId: req.params.uid,isDeleted: false})
    .select('-isDeleted');

    res.send(donations);
});

// Return all donation made by a single user
router.get('/donor/:uid',async(req,res) => {
    const donations = await Donation
    .find({userId: req.params.uid, isDeleted: false})
    .select('-isDeleted');
   // .populate('fundraiser','title story image organizer');

    res.send(donations);
});

// Post a donation
router.post('/:fid', auth,async(req, res) => {
    req.body.userId = req.user._id;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let donation = new Donation(req.body);
    const id = mongoose.Types.ObjectId(req.params.fid);
    const task = new Fawn.Task();
    try{
        task.save('donations',donation)
        .update('fundraisers',{_id:id},{$push: {donations:{$each:[donation._id], $sort:-1}},$inc: {totalRaised: donation.amount}})
        .update('teammembers', {_id: donation.memberId}, {$inc: {hasRaised: donation.amount}})
        .run();

        res.status(201).send(donation);
           
      }catch(e){
          console.log(e.message);
          res.status(500).send('Something went wrong');
      }
});

// Update an donation 
router.put('/:id',auth,async(req, res) => {
    req.body.userId = req.user._id;
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message); 

    const donation = await Donation.findByIdAndUpdate(req.params.id,req.body,{new: true}).select('-isDeleted');

    if (!donation) return res.status(404).send('Donation with the given ID was not found.');
    
    res.send(donation);
});

// Delete donation
router.delete('/:id',auth,async(req, res) => {
    const donation = await Donation.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});
    
    if(!donation) res.status(404).send('Donation with the given ID was not found.');
    
    res.send('Donation is deleted');
    // const task = Fawn.Task();
    // try{
    //     task.update('donations',{_id: donation._id},{isDeleted: true})
    //     .update('fundraisers',{_id:donation.fundraiser},{$pull: {donations: { $in: [donation._id] }}})
    //     .run();

    //     res.send('Donation is deleted')   
    //   }catch(e){
    //       res.status(500).send('Something went wrong');
    //   }
});

module.exports = router;