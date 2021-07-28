const _ = require('lodash');
const express = require('express');
const {Category,validate} = require('../models/category');
const {auth} = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express();

// Get all categories
router.get('/', async(req,res) => {
    const categories = await Category.find().sort('name');
    res.send(categories);
});

// Post a category
router.post('/', [auth,admin],async(req,res) => {
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    let category = new Category(_.pick(req.body,['name']));
    category = await category.save();

    res.send(category);
});

// Update a category
router.put('/:id',[auth,admin],async(req,res) => {
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    const category = await Category.findByIdAndUpdate(req.params.id,req.body,{new: true});

    if (!category) return res.status(404).send('The category with the given ID was not found.');

    res.send(category);
});

module.exports = router;