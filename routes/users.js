const _ = require('lodash');
const express = require('express');
const nodemailer = require('nodemailer');
const {User,validate} = require('../models/user');
const bcrypt = require('bcrypt');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');
const config = require('config');
const router = express();


// Get all users
router.get('/', [auth,admin],async(req, res) => {
    const users = await User.find().sort('firstName').select('-password');
    res.send(users);
});

// Get one user
router.get('/me', auth, async(req, res) => {
	const user = await User.findOne({_id: req.user._id, isDeleted: false}).select('-password -isDeleted');

    if (!user) return res.status(404).send('The user with the given ID was not found.');
	res.send(user);
});

// Register a user
router.post('/', async (req,res) => {
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);
	
    let user = await User.findOne({email:req.body.email});
	if(user) return res.status(400).send('User is already registered');
	
	user = new User(req.body);
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password,salt);
	
	await user.save();
	const token = user.generateAuthToken();
	res.header('access-control-expose-headers','x-auth-token');
	res.header('x-auth-token',token).status(201).send(_.pick(user,['_id','firstName','lastName','email']));
});

// Update a user
router.put('/me', auth, async(req, res) => {
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message); 

    let user = await User.findById(req.user._id);
	if(!user) return res.status(400).send('The user with the given ID was not found.');

    const samePassword = await bcrypt.compare(req.body.password, user.password);
	
	if(!samePassword){
        const salt = await bcrypt.genSalt(10);
	    req.body.password = await bcrypt.hash(req.body.password,salt);
    }else{
        req.body.password = user.password
    }

    user = await User.findByIdAndUpdate(req.user._id,req.body,{new: true}).select('-password -isDeleted');

    if (!user) return res.status(404).send('The user with the given ID was not found.');
    res.send(user);
});

router.post('/forget', async(req,res) => {
	const email = req.body.email;
	let user = await User.findOne({email:req.body.email});
	
	if(!user) return res.status(400).send('A user with this email address is not found!');
	const link = `${config.get('url')}/api/users/verify/${user._id}`;
	
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
		subject:'Reset password',
		html: "Hello,<br> Please click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
	};
	
	transporter.sendMail(mailOption, function(error, info){
		if(error){
			throw error;
			res.status(500).send('Something went wrong');
		}else{
			console.log('Email sent: '+ info.response);
			res.send('sent');
		}
	});
	
	
});

router.get('/verify/:id', async(req,res) => {

	let user = await User.findById(req.params.id);
	
	if(!user) return res.status(400).send('A user with this email address is not found!');
	
	res.send({id: req.params.id});
	
	
});

router.put('/reset/:id', async(req,res) => {
	const salt = await bcrypt.genSalt(10);
	req.body.password = await bcrypt.hash(req.body.password,salt);
	
	const user = await User.findByIdAndUpdate(req.params.id, {password: req.body.password},{new: true});
	
	res.send(user);
	
});

// Delete user
router.delete('/me', auth, async(req, res) => {
    const  user = await User.findByIdAndUpdate(req.user._id,{isDeleted: true},{new: true});

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send('User is deleted');

  //  const funds = await Fundraiser.find({organizer: user._id});

    // if(funds.length != 0){
    //     let task = Fawn.Task();
    //     try{
    //         task.update('users',{_id: user._id},{isDeleted: true});

    //         funds.forEach((fund) =>{
    //             task.update('fundraisers',{_id: fund._id},{isDeleted: true, updates: [], donations: []});
    //             task.update('donations',{fundraiser: fund._id},{isDeleted: true});
    //             task.update('notifications',{fundraiser: fund._id},{isDeleted: true});
    //             task.update('teammembers',{memberId: fund._id},{isDeleted: true});
    //             task.update('updates',{fundraiser: fund._id},{isDeleted: true});
    //         });
    //         task.run();

    //         res.send('User is deleted');

    //     }catch(e){
    //         res.status(500).send('Something went wrong');
    //     }
    // }else{
    //     user.isDeleted = true;
    //     res.send('User is deleted');
    //}

    
});

module.exports = router;