const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next){
	const token = req.header('x-auth-token');
	if(!token) return res.status(401).send('Access Denied. No token provided');
	
	try{
		const decoded = jwt.verify(token,config.get('jwtPrivateKey'));
		req.user = decoded;
		next();
	}catch(e){
		res.status(400).send('Invalid token');
	}
	
}

function authSocket(socket,next){
	if(socket.handshake.query && socket.handshake.query['token']){
		const token = socket.handshake.query['token'];
		jwt.verify(token,config.get('jwtPrivateKey'),function(err, decoded){
			if(err){
				//console.log(err);
				return next(new Error('Authentication error'));
			}
			socket.user = decoded;
			next();
		});
	}else{
		console.log('no query in socket');
		next(new Error('Authentication error'));
	}
}

module.exports = {
	auth: auth,
	authSocket: authSocket
}