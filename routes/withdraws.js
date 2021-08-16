const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const winston = require('winston');
const config = require('config');
const {Withdraw,validate} = require('../models/withdraw');
const {Fundraiser} = require('../models/fundraiser');
const {User} = require('../models/user');
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
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('A withdrawal with the given ID was not found.');
	}
    const withdraw = await Withdraw.findById(req.params.id);
	 if (!withdraw) return res.status(404).send('A withdrawal with the given ID was not found.');
    res.send(withdraw);
});

router.post('/beneficiary/invitation/:fid', auth, async(req,res) => {
	try{
		mongoose.Types.ObjectId(req.params.fid)
	}catch(e){
		return res.status(404).send('A fundraiser with the given ID was not found');
	}
	
	if(!req.body.email) return res.status(400).send('An empty body is not allowed');
	
	const fund = await Fundraiser.findById(req.params.fid);
	if(!fund) return res.status(404).send('A fundraiser with the given ID was not found');
	
	const email = req.body.email;
	let user = await User.findOne({email:req.body.email});
	if(!user) return res.status(400).send('A user with this email address is not found!');
	winston.info(config.get('db'));
	winston.info(config.get('email'));
	winston.info(config.get('url'));
	const alink = `${config.get('url')}/api/withdrawal/invitation/accept/${req.params.fid}`;
	const dlink = `${config.get('url')}/api/withdrawal/invitation/deny/${req.params.fid}`;
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: config.get('email'),
			pass: config.get('password')
		}
	});
	
	const mailOption = {
		from: config.get('email'),
		to:email,
		subject:'Withdrawal Request',
		html: "Hello,<br> You are invited to withdraw the money raised on your behalf. You can <a href="+alink+">accept</a> or <a href="+dlink+">decline</a> the invitation."
	};
	
	transporter.sendMail(mailOption, function(error, info){
		if(error){
			winston.error(error.message,error);
			//throw error;
			res.status(400).send(error.message);
		}else{
			console.log('Email sent: '+ info.response);
			res.send({id: user._id});
		}
	});
	
	
});

router.get('/invitation/accept/:fid', async(req,res) => {
		const fund = await Fundraiser.findById(req.params.fid);
		if(!fund) return res.status(404).send('A fundraiser with this id is not found');

		var recp = [];
		recp.push(fund.organizer);
		res.send({accepted: true});
		const newNot = new Notification({
            notificationType:'Withdrawal',
            recipients: recp,
            title:`Withdrawal Request`,
            content: 'Your beneficiary withdrawal request invitation has been accepted.',
            target: fund._id
            
        });
 
       await newNotification(newNot);
	
});

router.get('/invitation/deny/:fid', async(req,res) => {
		const fund = await Fundraiser.findById(req.params.fid);
		if(!fund) return res.status(404).send('A fundraiser with this id is not found');
		
		var recp=[];
		recp.push(fund.organizer);
		res.send({accepted: false});
		const newNot = new Notification({
            notificationType:'Withdrawal',
            recipients: recp,
            title:`Withdrawal Request`,
            content: 'Your beneficiary withdrawal request invitation has been declined.',
            target: fund._id
            
        });
 
       await newNotification(newNot);
	
});
// Post a withdraw
router.post('/:fid', auth,async(req,res) => {
	try{
		mongoose.Types.ObjectId(req.params.fid)
	}catch(e){
		return res.status(404).send('A fundraiser with this id is not found');
	}
	
	const fund = await Fundraiser.findById(req.params.fid);
	if(!fund) return res.status(404).send('A fundraiser with this id is not found');
	
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
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('A withdrawal with the given ID was not found.');
	}
	  let withdraw = await Withdraw.findById(req.params.id);
		if(!withdraw) return res.status(404).send('A withdrawal with the given ID was not found.');
		
	const id = mongoose.Types.ObjectId(req.params.id);
	
	if(!req.body.accepted){
		return res.status(400).send('An empty body is not allowed');
	}
	
	const fund = await Fundraiser.findOne({withdraw: id});
	
	if(!fund) return res.status(404).send('A fundraiser with this withdrawal id is not found');
	
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

         withdraw = await Withdraw.findByIdAndUpdate(id,{status: 'accepted'});
		if(!withdraw) return res.status(404).send('A withdrawal with the given ID was not found.');
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
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('A withdrawal with the given ID was not found.');
	}
	
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