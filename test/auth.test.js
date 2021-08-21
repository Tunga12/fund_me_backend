  process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const {User} = require('../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server;
let should = chai.should();

const serv = 'http://localhost:3000';
chai.use(chaiHttp);

describe('auth middleware', () => {
	before(() => { server = require('../index');});
	afterEach((done) => { 
		User.deleteMany({})
		.then(done())
		.catch((err) => console.log((err)=> console.log('Error auth: ',err)));
		
		//server.close(); 
	});

	let token; 

	  const exec = () => {
		
     
		return chai.request(serv)
		  .get('/api/users/me')
		  .set('x-auth-token', token);
		  
	 }

	
	
	//after(() => { server.close();});
  
	it('should return 401 if no token is provided', (done) => {
		token = ''; 
		exec().end((err, res) => {
			res.should.have.status(401);
			done();
		});
	

	});
	
	it('should return 400 if token is invalid', (done) => {
		token = 'a'; 
		exec().end((err, res) => {
			res.should.have.status(400);
			done();
		});

	});
  
	it('should return 200 if token is valid',(done) => {
		const user = new User({firstName:'firstName',lastName:'lastName', email:'firstt@gmail.com', password:'12345678',phoneNumber: '09085849995'});
	   token = user.generateAuthToken();
       user.save().then();
	   
	   
		exec().end((err, res) => {
			res.should.have.status(200);
			done();
		});
	});
  
  

	
	
});  