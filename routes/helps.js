const mongoose = require('mongoose');
const express = require('express');
const {Help,validate} = require('../models/help');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express();

// Get all helps
router.get('/', async(req,res) => {
    const helps = await Help.find({isDeleted: false}).sort('-date').select('-isDeleted');
    res.send(helps);
});

router.get('/category/:cat', async(req,res) => {
    const helps = await Help.find({category: req.params.cat,isDeleted: false}).sort('-date').select('-isDeleted');
    res.send(helps);
});

router.get('/:id', async(req,res) => {
	
    const help = await Help.findOne({_id: req.params.id, isDeleted:false}).select('-isDeleted');
	if(!help) return res.status(404).send('Help with the given ID was not found.');
    res.send(help);
});

// Post a help
router.post('/', [auth,admin],async(req,res) => {
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let help = new Help(req.body);
    help = await help.save();

    res.send(help);
});

// Update a help
router.put('/:id',[auth,admin],async(req,res) => {
	
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    const help = await Help.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!help) return res.status(404).send('Help with the given ID was not found.');

    res.send(help);
});

router.delete('/:id',auth,async(req, res) => {
	
    const help = await Help.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});

    if (!help) return res.status(404).send('Help with the given ID was not found.');

    res.send('Help is deleted') 

});


module.exports = router;