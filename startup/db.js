const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');
const Fawn = require('fawn');

module.exports = function(){
    const db = config.get('db');
	mongoose.connect(db,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
       })
    .then(() => winston.info('Connected to the database...'))
    .catch((err) => console.error('Error',err));

    Fawn.init(db);
    
}