const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');
const Fawn = require('fawn');

module.exports = function(){
    const db = config.get('db');
	mongoose.connect(db)
    .then(() => winston.info('Connected to ${db}...'))
    .catch((err) => console.error('Error',err));

    Fawn.init(db);
    
}