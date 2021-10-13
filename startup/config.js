const config = require('config');

module.exports = function(){
	if(!config.get('jwtPrivateKey')){
		throw new Error('Fatal error: jwt private key not defined');
		
	}
}