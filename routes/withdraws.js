const express = require('express');
const mongoose = require('mongoose');
const {Withdraw,validate} = require('../models/withdraw');
const {Fundraiser} = require('../models/fundraiser');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Notification} = require('../models/notification');
const {newNotification} = require('../startup/connection');
const Fawn = require('fawn');

const router = express();

// Get all withdraws
router.get('/',[auth,admin],async(req,res) => {
    const withdraws = await Withdraw.find().sort('date');
    res.send(withdraws);
});

router.get('/:id',auth,async(req,res) => {
    const withdraw = await Withdraw.findById(req.params.id);
    res.send(withdraw);
});

// Post a withdraw
router.post('/:fid', auth,async(req,res) => {
	const fund = await Fundraiser.findById(req.params.fid);
	if(!fund) return res.status(400).send('A fundraiser with this id is not found');
	
	if(req.body.isOrganizer === true){
		req.body.beneficiary = fund.organizer.toString();
	}
	
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

	
    const withdraw = new Withdraw(req.body);
	const id = mongoose.Types.ObjectId(req.params.fid);
	
	const task = new Fawn.Task();
    try{
        task.save('withdraws',withdraw)
        .update('fundraisers',{_id:id},{$set: {withdraw: withdraw._id}})
        .run();

        res.status(201).send(withdraw);
              
    }catch(e){
        console.log(e.message);
        res.status(500).send('Something went wrong');
    }
});

// Update a withdraw
router.put('/:id',[auth,admin],async(req,res) => {
	const id = mongoose.Types.ObjectId(req.params.id);
	const fund = await Fundraiser.findOne({withdraw: id});

	if(!fund) return res.status(400).send('A fundraiser with this id is not found');
	
	var recp=[];
	recp.push(fund.organizer);
	var content;
	
  const accepted = req.body.accepted;
	
	if(!accepted){
		const task = new Fawn.Task();
    try{
        task.update('withdraws',{_id: id},{$set: {status: 'denied'}})
        .update('fundraisers',{_id:fund._id},{$unset: {withdraw: ''}})
        .run();

        res.send('updated');
        content = 'Your withdrawal  request has been denied.';  
    }catch(e){
        console.log(e.message);
        res.status(500).send('Something went wrong');
    }
	}else{

        const withdraw = await Withdraw.findByIdAndUpdate(id,{status: 'accepted'});
		if(!withdraw) return res.status(400).send('');
		res.send('updated');
         content = 'Your withdrawal  request has been accepted';       
    
	}
	const newNot = new Notification({
            notificationType:'Withdrawal',
            recipients: recp,
            title:`Withdrawal request`,
            content: content,
            target: fund._id
            
        });
 
       await newNotification(newNot);
   
});

// Delete a notification
router.delete('/:id',auth,async(req, res) => {
    const withdraw = await Withdraw.findById(req.params.id);
    

    if (!withdraw) return res.status(404).send('A withdrawal with the given ID was not found.');
	
	const task = new Fawn.Task();
    try{
		task.update('withdraws',{_id: withdraw._id},{isDeleted: true})
		.update('fundraisers',{withdraw:withdraw._id},{$unset: {withdraw: ''}})
		.run();

		res.send('Withdrawal is deleted')   
	}catch(e){
		res.status(500).send('Something went wrong');
	}

});

module.exports = router;