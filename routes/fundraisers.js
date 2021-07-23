const _ = require('lodash');
const express = require('express');
const {Fundraiser,validate,getPagination} = require('../models/fundraiser');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

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
        select:'title image totalRaised goalAmount donations location',
        populate: population};
        
    const funds = await Fundraiser.paginate(query, options);
    
    res.send(toBeSent(funds));
});

// Get fundraisers by id
router.get('/:id', async(req, res) => {
    const page = parseInt(req.query.page);
    const offset = page ? page : 0;
    const size = 5;
    const fund = await Fundraiser.findOne({_id:req.params.id,isDeleted: false,})
    .select('-isDeleted')
    .slice('donations',[offset * size,size])
    .populate('category','name')
    .populate('organizer','firstName lastName email')
    .populate('beneficiary','firstName lastName email')
    .populate({path: 'teams', populate:{path: 'userId', select:'firstName lastName email'}})
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
        select:'title image totalRaised goalAmount donations',
        populate: population};
        
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

// Get fundraisers by Id of organizers or by id of team members
router.get('/user/:uid', async(req, res) => {
    const {page, size } = req.query;
    const {limit, offset} = getPagination(parseInt(page), parseInt(size));

    let query = {organizer: req.params.uid,isDeleted: false};
    const options = {
        offset:offset,
        limit:limit,
        sort:'-dateCreated',
        select:'title image totalRaised goalAmount donations',
        populate: population};
    let funds = await Fundraiser.paginate(query, options);
    if(funds.docs.length === 0){
        console.log('jfkfj');
        query = {teams: {$in: [req.params.uid]},isPublished:true,isDeleted: false};
        funds = await Fundraiser.paginate(query, options);
    }
    
    res.send(toBeSent(funds));
});

// Post fundraiser
router.post('/', auth,async(req, res) => {
    req.body.organizer = req.user._id;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let fund = new Fundraiser(req.body);
    fund = await fund.save();

    res.status(201).send(fund);
});

// Update a fundraiser
router.put('/:id', auth,async(req, res) => {
    req.body.organizer = req.user._id;
	const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message); 

    const fund = await Fundraiser.findByIdAndUpdate(req.params.id,req.body,{new: true}).select('-isDeleted');

    if (!fund) return res.status(404).send('The user with the given ID was not found.');
    
    res.send(fund);
});

// Delete fundraiser
router.delete('/:id',auth,async(req, res) => {
    const fund = await Fundraiser.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true});

    if (!fund) return res.status(404).send('The user with the given ID was not found.');

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
    {path: 'donations',select: 'date'}
    
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
