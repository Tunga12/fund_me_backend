const winston = require('winston');
//require('winston-mongodb');
require('express-async-errors');

module.exports = function(){
	
	winston.handleExceptions(
		new winston.transports.Console({colorize:true, prettyPrint: true}),
		new winston.transports.File({filename: 'uncaughtException.log'}));
		
		//throw new Error('Another Exception');
	
	process.on('unhandledRejection', (err) => {
		throw err;
	});
	
// 	process.on('uncaughtException', (err) => {
// 	console.log('WE GOT UNCAUGHT EXCEPTION');
// 	winston.error(err.message,err);
// }); 



// const p = Promise.reject('Something failed miserably');
// p.then(() => {console.log('Done')});

	winston.add(winston.transports.File,{filename:'logfile.log'});
	// winston.add(winston.transports.MongoDB,
	// 	{db:'mongodb://localhost/movies',level:'info'}
	// );
}