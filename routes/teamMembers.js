const _ = require('lodash');
const express = require('express');
const mongoose = require('mongoose');
const {TeamMember,validate} = require('../models/teamMember');
const {User} = require('../models/user');
const {Fundraiser} = require('../models/fundraiser');
const {Notification} = require('../models/notification');
const {newNotification} = require('../startup/connection');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');
const Fawn = require('fawn');
//Fawn.init(mongoose);
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
   // req.body.userId = req.user._id;
    var email = req.body.email;
    const user = await User.findOne({email: email});
	if(!user) return res.status(400).send('A user with this email address does not exist.');
	
	const mem = {userId: user._id.toString()};
    const {error} = validate(mem);
	if(error) return res.status(400).send(error.details[0].message);
	
	 const id = mongoose.Types.ObjectId(req.params.fid);
	 
	const fund = await Fundraiser.findOne({'teams.userId':mem.userId, _id: id});
	if(fund)return res.status(400).send('A team member with this email address already exists.');
	
    let member = new TeamMember(mem);
   
	
    const task = new Fawn.Task();
    try{
        task.save('teammembers',member)
        .update('fundraisers',{_id:id},{$push: {teams:{$each:[{id: member._id, userId: member.userId, status: 'pending'}], $sort:-1}}})
        .run();

        res.status(201).send(member);
           
      }catch(e){
          console.log(e.message);
          res.status(500).send('Something went wrong');
      }
	  var recp = [];
	  recp.push(member.userId);
	   const newNot = new Notification({
            notificationType:'Team Member',
            recipients: recp,
            title:`Membership invitation`,
            content: `You are invited to be a member of fundraiser '${fund.title}'`,
            target: req.params.fid
            
        });
      //  newNot.target =  'jkkkkkkkkkkkkkkkkkjkjkkk';
       await newNotification(newNot);

});



// Update a member
router.put('/:id', auth,async(req,res) => {
    //req.body.userId = req.user._id;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    const member = await TeamMember.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!member) return res.status(404).send('A member with the given ID was not found.');

    res.send(member);
});

// Delete a member
router.delete('/:id',auth,async(req, res) => {
    /* const member = await TeamMember.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});

    if (!member) return res.status(404).send('A member with the given ID was not found.');

    res.send('Your membership is terminated'); */
	
	  const member = await TeamMember.findOne({_id:req.params.id, isDeleted: false});
    
    if(!member) res.status(404).send('A team member with the given ID was not found.');

  //  res.send('Update is deleted');
    const task = new Fawn.Task();
    try{
		task.update('teammembers',{_id: member._id},{isDeleted: true})
		.update('fundraisers',{'teams.id':member._id},{$pull:{'teams': {'id': member._id}}})
		.run();

		res.send('Your membership is terminated')   
	}catch(e){
		res.status(500).send('Something went wrong');
    }
});

module.exports = router;