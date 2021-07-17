const winston = require('winston');
const mongoose = require('mongoose');
const Fawn = require('fawn');

module.exports = function(){
	mongoose.connect('mongodb://localhost/crowd',{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
       })
    .then(() => winston.info('Connected to the database...'))
    .catch((err) => console.error('Error',err));

    Fawn.init('mongodb://localhost/crowd');
    
}