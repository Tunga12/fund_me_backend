const _ = require('lodash');
const express = require('express');
const {Donation,validate} = require('../models/donation');
const {Fundraiser} = require('../models/fundraiser');
const {Notification} = require('../models/notification');
const {User} = require('../models/user');
const {auth} = require('../middleware/auth');
const {newNotification} = require('../startup/connection');
const Fawn = require('fawn');
const mongoose = require('mongoose');
const admin = require('../middleware/admin');

//Fawn.init(mongoose);
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
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('Donation with the given ID was not found.');
	}
	
    const donation = await Donation.findOne({_id: req.params.id,isDeleted: false})
    .select('-isDeleted')
    .populate('userId','firstName lastName email');

    if (!donation) return res.status(404).send('Donation with the given ID was not found.');

    res.send(donation);
});

//Get donations by memberId
router.get('/member/:uid', async(req, res) => {
	try{
		mongoose.Types.ObjectId(req.params.uid)
	}catch(e){
		return res.status(200).send([]);
	}
	
    const donations = await Donation.find({memberId: req.params.uid,isDeleted: false})
    .select('-isDeleted');
	

    res.send(donations);
});

// Return all donation made by a single user
router.get('/donor/:uid',async(req,res) => {
	try{
		mongoose.Types.ObjectId(req.params.uid)
	}catch(e){
		return res.status(200).send([]);
	}
	
    const donations = await Donation
    .find({userId: req.params.uid, isDeleted: false})
    .select('-isDeleted');
   // .populate('fundraiser','title story image organizer');

    res.send(donations);
});

// Post a donation
router.post('/:fid', auth,async(req, res) => {
	try{
		mongoose.Types.ObjectId(req.params.fid)
	}catch(e){
		return res.status(404).send('A fundraiser with the given ID was not found');
	}
	let fund = await Fundraiser.findById(req.params.fid);
	if(!fund) return res.status(404).send('A fundraiser with the given ID was not found');
	
    req.body.userId = req.user._id;
    req.target = req.params.fid;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let donation = new Donation(req.body);
	
    const id = mongoose.Types.ObjectId(req.params.fid);
    const task = new Fawn.Task();
	if(donation.memberId){
    try{
        task.save('donations',donation)
        .update('fundraisers',{_id:id},{$push: {donations:{$each:[donation._id], $sort:-1}},$inc: {totalRaised: donation.amount}})
        .update('teammembers', {_id: donation.memberId}, {$inc: {hasRaised: donation.amount}})
        .run();
        }catch(e){
            console.log(e.message);
            res.status(500).send('Something went wrong');
        }
	}else{
		 try{
        task.save('donations',donation)
        .update('fundraisers',{_id:id},{$push: {donations:{$each:[donation._id], $sort:-1}},$inc: {totalRaised: donation.amount}})
        .run();
        }catch(e){
            console.log(e.message);
            res.status(500).send('Something went wrong');
        }
	}
        res.status(201).send(donation);

       //fund = await Fundraiser.findById(id);
        var recp = [];
        recp.push(fund.organizer);
        const user = await User.findById(donation.userId);

        const newNot = new Notification({
            notificationType:'Donation',
            recipients: recp,
            title:`${fund.title}[Donation]`,
            content: `${user.firstName} ${user.lastName} donated ${donation.amount} birr.`,
            target: req.params.fid
            
        });
      //  newNot.target =  'jkkkkkkkkkkkkkkkkkjkjkkk';
       await newNotification(newNot);
       // io.emit('notification',newNot);
        
           
      
});

// Update an donation 
router.put('/:id',auth,async(req, res) => {
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('Donation with the given ID was not found.');
	}
    req.body.userId = req.user._id;
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message); 

    const donation = await Donation.findByIdAndUpdate(req.params.id,req.body,{new: true}).select('-isDeleted');

    if (!donation) return res.status(404).send('Donation with the given ID was not found.');
    
    res.send(donation);
});

// Delete donation
router.delete('/:id',auth,async(req, res) => {
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('Donation with the given ID was not found.');
	}
    const donation = await Donation.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});
    
    if(!donation) return res.status(404).send('Donation with the given ID was not found.');
    
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