const _ = require('lodash');
const express = require('express');
const {Reason,validate} = require('../models/reportReason');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express();

// Get all categories
router.get('/', async(req,res) => {
    const reasons = await Reason.find().sort('name');
    res.send(reasons);
});

router.get('/:id', async(req,res) => {
	 
const reason = await Reason.findOne({_id:req.params.id});
	if(!reason) return res.status(404).send('Reason with the given ID was not found.');
    res.send(reason);
});

// Post a category
router.post('/', [auth,admin],async(req,res) => {
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let reason = new Reason(_.pick(req.body,['name']));
    reason = await reason.save();

    res.send(reason);
});

// Update a category
router.put('/:id',[auth,admin],async(req,res) => {
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    const reason = await Reason.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!reason) return res.status(404).send('A report reason with the given ID was not found.');

    res.send(reason);
});

router.delete('/:id', async(req,res) => {
	
    const reason = await Reason.findByIdAndRemove(req.params.id);
	if(!reason) return res.status(404).send('Reason with the given ID was not found.');
    res.send('Reason is deleted!');
});

module.exports = router;