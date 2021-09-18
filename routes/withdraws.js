const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const winston = require('winston');
const config = require('config');
const {Withdraw,validate,getPagination} = require('../models/withdraw');
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
	 const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));
    const query = {};
    const options = {
        offset:offset,
        limit:limit,
        sort:'-date',
        populate: population};
        
    const withdraws = await Withdraw.paginate(query, options);
    
    res.send(toBeSent(withdraws));
  
});

router.get('/status/:stat',[auth,admin],async(req,res) => {
     const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));
    const query = {status: req.params.stat};
    const options = {
        offset:offset,
        limit:limit,
        sort:'-date',
        populate: population};
        
    const withdraws = await Withdraw.paginate(query, options);
    
    res.send(toBeSent(withdraws));

  
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
	
	console.log(config.get('email'));
	console.log(config.get('password'));
	console.log(config.get('url'));
	var recp = [];
	
	const email = req.body.email;
	let user = await User.findOne({email:req.body.email});
	if(!user) return res.status(404).send('A user with this email address is not found!');
	
	recp.push(user._id);
	
	const alink = `${config.get('link')}/accept?fundraiser=${req.params.fid}&beneficiary=${user._id}`;
	const dlink = `${config.get('link')}/decline`;
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
			res.send('sent');
		}
	});
	
	const newNot = new Notification({
				notificationType:'Withdrawal',
				recipients: recp,
				title:`Beneficiary invitation`,
				content: 'Hello, You are invited to withdraw the money raised on your behalf.',
				target: fund._id
				
			});
	 
		   await newNotification(newNot);
	
	
});

router.get('/invitation/accept/:fid', async(req,res) => {
	try{
		mongoose.Types.ObjectId(req.params.fid)
	}catch(e){
		return res.status(404).send('A fundraiser with this id is not found');
	}
		const fund = await Fundraiser.findById(req.params.fid);
		if(!fund) return res.status(404).send('A fundraiser with this id is not found');
		
		/* const withdraw = await Withdraw.findByIdAndUpdate(fund.withdraw.id,{$set: {invitationStatus: 'accepted'}});
		if(!withdraw) return res.status(404).send('A fundraiser with this id is not found'); */
		
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

router.get('/invitation/decline/:fid', async(req,res) => {
	try{
		mongoose.Types.ObjectId(req.params.fid)
	}catch(e){
		return res.status(404).send('A fundraiser with this id is not found');
	}
		const fund = await Fundraiser.findById(req.params.fid);
		if(!fund) return res.status(404).send('A fundraiser with this id is not found');
		
		/* const withdraw = await Withdraw.findByIdAndUpdate(fund.withdraw.id,{$set: {invitationStatus: 'declined'}});
		if(!withdraw) return res.status(404).send('A fundraiser with this id is not found'); */
		
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
	
	
	
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

	if(req.body.isOrganizer === true){
		if(fund.organizer.toString() != req.user._id.toString()){
			return res.status(403).send('You are not authorized to submit the withdrawal form.');
		}
	}else{
		if(fund.beneficiary.toString() !== req.user._id.toString()){
			return res.status(403).send('You are not authorized to submit the withdrawal form.');
		}
	}
	
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
	/*
	if(!req.body){
		return res.status(400).send('An empty body is not allowed');
	}
*/	
	const fund = await Fundraiser.findOne({'withdraw': id});
	if(!fund) return res.status(404).send('A fundraiser with this withdrawal id is not found');
	
	if(withdraw.status === 'pending'){
		var recp=[];
		if(withdraw.isOrganizer){
			recp.push(fund.organizer);
		}else{
			recp.push(fund.beneficiary);
		}
		var content;
		
		const accepted = req.body.accepted;
		
		if(!accepted){
			const task = new Fawn.Task();
		try{
			task.update('withdraws',{_id: id},{$set: {status: 'declined'}})
			//.update('fundraisers',{_id:fund._id},{$unset: {withdraw: ''}})
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
	}else{
		res.status(400).send('This withdrawal request has already been accepted or declined.');
	}
   
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
const population = [
    {path: 'beneficiary',select: 'firstName lastName email'},
    
];

function toBeSent(withdraw){
   
    return {
        totalItems: withdraw.totalDocs,
        withdrawals: withdraw.docs,
        totalPages: withdraw.totalPages,
        currentPage: withdraw.page - 1,
        hasNextPage: withdraw.hasNextPage,
        hasPrevPage: withdraw.hasPrevPage
    };
}
module.exports = router;