const winston = require('winston');
const mongoose = require('mongoose');
const Fawn = require('fawn');

module.exports = function(){
	mongoose.connect('mongodb://crowd:BavnzHY02VgNLApN@crowdcluster.yw6fz.mongodb.net/crowd?retryWrites=true&w=majority',{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
       })
    .then(() => winston.info('Connected to the database...'))
    .catch((err) => console.error('Error',err));

    Fawn.init('mongodb://crowd:BavnzHY02VgNLApN@crowdcluster.yw6fz.mongodb.net/crowd?retryWrites=true&w=majority');
    
}