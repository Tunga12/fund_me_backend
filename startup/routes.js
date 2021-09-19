const express = require('express');
const users = require('../routes/users');
const categories = require('../routes/categories');
const reasons = require('../routes/reportReasons');
const fundraisers = require('../routes/fundraisers');
const updates = require('../routes/updates');
const donations = require('../routes/donations');
const teamMembers = require('../routes/teamMembers');
const notifications = require('../routes/notifications');
const helps = require('../routes/helps');
const reports = require('../routes/reports');
const payment = require('../routes/payment');
const tpayment = require('../routes/testpay');
const withdraw = require('../routes/withdraws');
const image = require('../routes/image');
const auth = require('../routes/auth');
const error = require('../middleware/error');


module.exports = function(app){
	app.use(express.json());
    //app.use('/donation', status);
    app.use('/api/categories',categories);
	app.use('/api/reasons',reasons);
    app.use('/api/fundraisers',fundraisers);
    app.use('/api/updates', updates);
    app.use('/api/donations', donations);
    app.use('/api/members', teamMembers);
    app.use('/api/notifications', notifications);
    app.use('/api/donation', payment);
	app.use('/api/payment', tpayment);
	app.use('/api/withdrawal', withdraw);
	app.use('/api/help', helps);
	app.use('/api/report', reports);
	app.use('/api/users', users);
    app.use('/api/image', image);
    app.use('/api/auth', auth);
	app.use(error);
}