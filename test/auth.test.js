process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const {User} = require('../models/user');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server;
let should = chai.should();


chai.use(chaiHttp);

describe('auth middleware', () => {
	before(() => { server = require('../index'); });
	afterEach(async (done) => { 
		await User.deleteOne({email: 'first@gmail.com'});
		done();
		//server.close(); 
	});

	let token; 

	  const exec = () => {
		
     
		return chai.request(server)
		  .get('/api/users/me')
		  .set('x-auth-token', token);
		  
	  }

  beforeEach(async(done) => {
	   let user = {firstName:'firstName',lastName:'lastName', email:'first@gmail.com', password:'12345678'};
	   user = new User(user);
	   token = user.generateAuthToken();
      await user.save(user);
	  done();
	  
	
  });
  
  it('should return 401 if no token is provided', async (done) => {
	token = ''; 

	//const res = await exec();
	try{
	chai.request(server)
		  .get('/api/users/me')
		  .set('x-auth-token', token).end((err, res) => {
		
				res.should.have.status(401);

				done();
	});
	}catch(e){
		console.log(e);
	}

   // expect(res.status).toBe(401);
  });
  
  

	
	
});