const _ = require('lodash');
const express = require('express');
const mongoose = require('mongoose');
const {Fundraiser,validate,getPagination} = require('../models/fundraiser');
const {User} = require('../models/user');
const {TeamMember} = require('../models/teamMember');
const {Notification} = require('../models/notification');
const {newNotification} = require('../startup/connection');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');
const Fawn = require('fawn');

const router = express();

// Get popular fundraisers
router.get('/popular', async(req, res) => {
    const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));
    const query = {isPublished:true,isDeleted: false};
    const options = {
        offset:offset,
        limit:limit,
       // slice: [{path:'donations',val:1}],
        sort:'-totalRaised -dateCreated',
        select:'title image totalRaised goalAmount donations location likedBy',
        populate: population};
        
    const funds = await Fundraiser.paginate(query, options);
    res.send(toBeSent(funds));
});

// Get fundraisers by title
router.get('/title/:name', async(req, res) => {
    const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));
	const regex = new RegExp(req.params.name, 'i');
	const query = {isPublished:true,isDeleted: false,title: {'$regex': regex}};
	const options = {
		offset:offset,
		limit:limit,
		sort:'-totalRaised -dateCreated',
		select:'title image totalRaised goalAmount donations location likedBy',
		populate: population};
		
	const funds = await Fundraiser.paginate(query, options);
	
	res.send(toBeSent(funds));
	
});

// Get fundraisers by Id of organizer
router.get('/user', auth,async(req, res) => {
    const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));

    const query = {organizer: req.user._id,isDeleted: false};
    const options = {
        offset:offset,
        limit:limit,
        sort:'-dateCreated',
        select:'title image totalRaised goalAmount donations likedBy',
        populate: population};
    const funds = await Fundraiser.paginate(query, options);
    
    res.send(toBeSent(funds));
});

// Get fundraisers by Id of beneficiary
router.get('/beneficiary', auth,async(req, res) => {
    const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));

    const query = {beneficiary: req.user._id,isDeleted: false};
    const options = {
        offset:offset,
        limit:limit,
        sort:'-dateCreated',
        select:'title image totalRaised goalAmount donations likedBy',
        populate: population};
    const funds = await Fundraiser.paginate(query, options);
  
    res.send(toBeSent(funds));
});

// Get fundraisers by Id of members
router.get('/member', auth,async(req, res) => {
	
    const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));

    const query = {organizer: { $ne: req.user._id},'teams.userId': req.user._id, 'teams.status': 'accepted',isDeleted: false};
    const options = {
        offset:offset,
        limit:limit,
        sort:'-dateCreated',
        select:'title image totalRaised goalAmount donations likedBy',
        populate: population};
    const funds = await Fundraiser.paginate(query, options);
   
    
    res.send(toBeSent(funds));
});



// Get fundraisers by id
router.get('/:id', async(req, res) => {
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('A fundraiser with the given ID was not found.');
	}
    const page = parseInt(req.query.page);
    const offset = page ? page : 0;
    const size = 5;
    const fund = await Fundraiser.findOne({_id:req.params.id,isDeleted: false,})
    .select('-isDeleted')
    .slice('donations',[offset * size,size])
    .populate('category','name')
	.populate('withdraw')
    .populate('organizer','firstName lastName email')
    .populate('beneficiary','firstName lastName email')
    .populate({path: 'teams', select:'id status',populate:{path: 'id', select:'hasRaised shareCount status userId',populate: {path:'userId', select: 'firstName lastName email'}}})
    .populate({path: 'donations', populate:{path: 'userId', select:'firstName lastName email'}})
    .populate({path:'updates',populate:{path: 'userId', select:'firstName lastName email'}});
    

    if (!fund) return res.status(404).send('A fundraiser with the given ID was not found.');

    res.send(fund);
});

// Get all fundraisers (for admin)
router.get('/', [auth, admin],async(req, res) => {
    const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));
    const query = {};
    const options = {
        offset:offset,
        limit:limit,
        sort:'-dateCreated',
        select:'title image totalRaised goalAmount donations dateCreated withdraw',
        populate: populationA};
        
    const funds = await Fundraiser.paginate(query, options);
    
    res.send(toBeSent(funds));
});



// Get fundraisers by category
router.get('/category/:cid', async(req, res) => {
    const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));

    const query = {category: req.params.cid,isPublished:true,isDeleted: false};
    const options = {
        offset:offset,
        limit:limit,
        sort:'-dateCreated',
        select:'title image totalRaised goalAmount donations',
        populate: population};
    const funds = await Fundraiser.paginate(query, options);
    
    res.send(toBeSent(funds));
});


// Post fundraiser
router.post('/', auth,async(req, res) => {
	
    req.body.organizer = req.user._id;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);
	
	const team = new TeamMember({userId: req.user._id});
	let teams = [];
	teams.push({id: team._id, userId: req.user._id, status: 'accepted'});
	req.body.teams = teams;
	
    const fund = new Fundraiser(req.body);
    const task = new Fawn.Task();
		try{
        task.save('teammembers',team)
        .save('fundraisers',fund)
        .run();

           
      }catch(e){
          console.log(e.message);
          res.status(500).send('Something went wrong');
      }

    res.status(201).send(fund);
});

router.put('/invitation/:fid', auth, async(req,res) => {
	try{
		mongoose.Types.ObjectId(req.params.fid)
	}catch(e){
		return res.status(404).send('A fundraiser with the given ID was not found.');
	}
	/*
	if(req.body == {}) return res.status(400).send('An empty body is not allowed');
	*/
	const id = mongoose.Types.ObjectId(req.params.fid);
	const fund = await Fundraiser.findById(req.params.fid);
	
	if(!fund) return res.status(404).send('A fundraiser with the given ID was not found.');
	
	var teamid;
	fund.teams.forEach((team)=>{
		if(team.userId.toString() === req.user._id.toString()){
			teamid = team.id;
			if(team.status !== 'pending') return res.status(404).send('This invitation has already been accepted or declined.');
					
		}
	});
	
	const user = await User.findById(req.user._id);
	var recp= [];
	
	var content;
	var title;
	const accepted = req.body.accepted;
	
	if(accepted){
		await Fundraiser.updateOne({_id: req.params.fid, 'teams.userId':user._id},{$set:{
			'teams.$.status': 'accepted'
		}});
		content = `${user.firstName} ${user.lastName} has accepted your invitation to join the team of your fundraiser '${fund.title}'`;
		
	}else{
		
		
		const task = new Fawn.Task();
		try{
        task.update('teammembers',{_id:teamid},{isDeleted: true})
        .update('fundraisers',{_id:id},{$pull:{'teams': {'userId': user._id}}})
        .run();

           
      }catch(e){
          console.log(e.message);
          res.status(500).send('Something went wrong');
      }
		
		content = `${user.firstName} ${user.lastName} has declined your invitation to join the team of your fundraiser '${fund.title}'`;
		
	}
	
	res.send('done');
	recp.push(fund.organizer);

	const newNot = new Notification({
            notificationType:'Invitation Acceptance',
            recipients: recp,
            title:`Membership invitation`,
            content: content,
            target: req.params.fid
            
        });
 
       await newNotification(newNot);
});

// Update a fundraiser
router.put('/:id', auth,async(req, res) => {
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('A fundraiser with the given ID was not found.');
	}
    //req.body.organizer = req.user._id;
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message); 
	
	let fund = await Fundraiser.findById(req.params.id);
	if (!fund) return res.status(404).send('A fundraiser with the given ID was not found.');
	
	if(req.body.likeCount){
		if(parseInt(fund.likeCount) != parseInt(req.body.likeCount)){
			//req.body.$push = {likedBy: req.user._id};
			fund = await Fundraiser.findByIdAndUpdate(req.params.id,{$push: {likedBy: req.user._id}},{new: true}).select('-isDeleted');
			
		}
	}
	fund = await Fundraiser.findByIdAndUpdate(req.params.id,req.body,{new: true}).select('-isDeleted');

			if (!fund) return res.status(404).send('A fundraiser with the given ID was not found.');
   
    
    res.send(fund);
});



// Delete fundraiser
router.delete('/:id',auth,async(req, res) => {
	try{
		mongoose.Types.ObjectId(req.params.id)
	}catch(e){
		return res.status(404).send('A fundraiser with the given ID was not found.');
	}
    const fund = await Fundraiser.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});

    if (!fund) return res.status(404).send('A fundraiser with the given ID was not found.');

    res.send('Fundraiser is deleted') 

    // const task = Fawn.Task();
    // try{
    //     task.update('fundraisers',{_id: fund._id},{isDeleted: true, updates: [],donations: []})
    //     .update('donations',{fundraiser: fund._id},{isDeleted: true})
    //     .update('notifications',{fundraiser: fund._id},{isDeleted: true})
    //     .update('teammembers',{memberId: fund._id},{isDeleted: true})
    //     .update('updates',{fundraiser: fund._id},{isDeleted: true})
    //     .run();

    //     res.send('Fundraiser is deleted')   
    //   }catch(e){
    //       res.status(500).send('Something went wrong');
    //   }
});

const population = [
    {path: 'donations',select: 'date'},
    
];

const populationA = [
    {path: 'donations',select: 'date'},
	{path: 'withdraw'}
    
];

function toBeSent(funds){
    funds.docs.forEach(fund => {
        if(funds.docs.length != 0 && fund.donations.length != 0){
            fund.donations = fund.donations.slice(0,1);
        }
    })
    return {
        totalItems: funds.totalDocs,
        fundraisers: funds.docs,
        totalPages: funds.totalPages,
        currentPage: funds.page - 1,
        hasNextPage: funds.hasNextPage,
        hasPrevPage: funds.hasPrevPage
    };
}

module.exports = router;
