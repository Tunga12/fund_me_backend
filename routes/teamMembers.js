const _ = require('lodash');
const express = require('express');
const mongoose = require('mongoose');
const {TeamMember,validate} = require('../models/teamMember');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Fawn = require('fawn');
Fawn.init(mongoose);
const router = express();

// Get all members (for admin)
router.get('/',[auth,admin], async(req,res) => {
    const members = await TeamMember
    .find().sort('-_id');

    res.send(members);
});

// Get member by id
router.get('/:id',async(req,res) => {
    const member = await TeamMember
    .findOne({_id: req.params.id, isDeleted: false})
    .select('-isDeleted')
    .populate('userId','firstName lastName email');

    if (!member) return res.status(404).send('Member with the given ID was not found.');

    res.send(member);
});


// Return all membership of a single user
router.get('/membership/:uid',async(req,res) => {
    const members = await TeamMember
    .find({userId: req.params.uid, isDeleted: false})
    .select('-isDeleted');

    res.send(members);
});

// Post a member
router.post('/:fid',auth,async(req,res) => {
    req.body.userId = req.user._id;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let member = new TeamMember(req.body);
    const id = mongoose.Types.ObjectId(req.params.fid);
    const task = new Fawn.Task();
    try{
        task.save('teammembers',member)
        .update('fundraisers',{_id:id},{$push: {teams:{$each:[member._id], $sort:-1}}})
        .run();

        res.status(201).send(member);
           
      }catch(e){
          console.log(e.message);
          res.status(500).send('Something went wrong');
      }

});

// Update a member
router.put('/:id', auth,async(req,res) => {
    req.body.userId = req.user._id;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    const member = await TeamMember.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!member) return res.status(404).send('A member with the given ID was not found.');

    res.send(member);
});

// Delete a member
router.delete('/:id',auth,async(req, res) => {
    const member = await TeamMember.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});

    if (!member) return res.status(404).send('A member with the given ID was not found.');

    res.send('Your membership is terminated');
});

module.exports = router;