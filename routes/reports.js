const mongoose = require('mongoose');
const express = require('express');
const {Report,validate} = require('../models/report');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express();
//helps
//help
// Get all reports
router.get('/', [auth,admin],async(req,res) => {
    const reports = await Report.find({isDeleted: false})
	.sort('-date').select('-isDeleted')
	.populate('reason','name');
    res.send(reports);
});


router.get('/:id',[auth,admin],async(req,res) => {
	 
    const report = await Report.findOne({_id: req.params.id, isDeleted:false})
	.select('-isDeleted')
	.populate('reason','name');
	if(!report) return res.status(404).send('Report with the given ID was not found.');
    res.send(report);
});

// Post a report
router.post('/', auth,async(req,res) => {
	req.body.userId = req.user._id;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let report = new Report(req.body);
    report = await report.save();

    res.send(report);
});

// Update a report
router.put('/:id',auth,async(req,res) => {
	
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    const report = await Report.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!report) return res.status(404).send('Report with the given ID was not found.');

    res.send(report);
});

router.delete('/:id',auth,async(req, res) => {
	
    const report = await Report.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});

    if (!report) return res.status(404).send('Report with the given ID was not found.');

    res.send('Report is deleted') 

});


module.exports = router;