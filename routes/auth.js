const express = require('express');
const {User} = require('../models/user');
const router = express();
const bcrypt = require('bcrypt');
const Joi = require('joi');

// Login a user
router.post('/', async (req,res) => {
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);
	
    let user = await User.findOne({email:req.body.email,isDeleted: false});
	if(!user) return res.status(400).send('Invalid email or password');
	
	
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	
	if(!validPassword) return res.status(400).send('Invalid email or password');
	
	const token = user.generateAuthToken();
	res.header('access-control-expose-headers','x-auth-token');
	res.header('x-auth-token',token).status(201).send(true);
	//res.send(token);
});

function validate(req){
	const schema = Joi.object({
		email: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required()
	});
	
	return schema.validate(req);
}

module.exports = router;