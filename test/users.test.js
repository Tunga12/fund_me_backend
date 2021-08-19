process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const {User} = require('../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server;
let should = chai.should();

const serv = 'http://localhost:3000';
chai.use(chaiHttp);

describe('/api/users', () => {
	before(() => { server = require('../index');});
	afterEach((done) => { 
		User.deleteMany({})
		.then(done())
		.catch((err) => console.log((err)=> console.log(err)));
		
		//server.close(); 
	});

	

	 

	
  
	describe('GET /', () => {
		let token; 
		 const exec = () => {
		
     
		return chai.request(serv)
		  .get('/api/users')
		  .set('x-auth-token', token);
		  
		}
		
		before(() => {
			
			
		});
	 
		beforeEach((done) => {
			
			const users = [
				{ firstName: 'first1' , lastName: 'last1', email: 'first1@gmail.com', password: '12345678',phoneNumber: '0958994488'},
				{ firstName: 'first2' , lastName: 'last2', email: 'first2@gmail.com', password: '12345678',phoneNumber: '09485849995'},
			];
			  
			User.collection.insertMany(users).then();
			token = new User({ isAdmin: true }).generateAuthToken();  
			done();
		});
		
		
		
		
		it('should return 401 if client is not logged in',(done) => {
			token = ''; 
			exec().end((err, res) => {
				res.should.have.status(401);
				done();
			});
		});
		
		it('should return 403 if the user is not an admin',(done) => {
			token = new User({ isAdmin: false }).generateAuthToken(); 

			exec().end((err, res) => {
				res.should.have.status(403);

				done();
			});

		  
		});
		
		it('should return all users',(done) => {
			
			
			exec().end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
                res.body.length.should.be.eql(2);
				res.body[0].should.have.property('firstName').eql('first1');

				done();
			}); 
			
		});
  });
  
  	describe('GET /me', () => {
		let token; 
		 const exec = () => {
		
     
		return chai.request(serv)
		  .get('/api/users/me')
		  .set('x-auth-token', token);
		  
		}
		
		before(() => {
			
			
		});
	 
		beforeEach((done) => {
			
		
			  
			const user = new User({ firstName: 'first1' , lastName: 'last1', email: 'first3@gmail.com', password: '12345678',phoneNumber: '09589884488'});
			
			token = user.generateAuthToken();  
			user.save().then(done());
			
		});
		
		
		
		
		it('should return 401 if client is not logged in',(done) => {
			token = ''; 
			exec().end((err, res) => {
				res.should.have.status(401);
				done();
			});
		});
	
		it('should return 404 if the user is not found',(done) => {
			token = new User({ isAdmin: false }).generateAuthToken(); 

			exec().end((err, res) => {
				res.should.have.status(404);
				done();
			});
			
		});
		
		it('should return a user',(done) => {
			
			
			exec().end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('firstName').eql('first1');

				done();
			}); 
			
		});
  });
  
  describe('GET /verify:id', () => {
		let id; 
		 
		 const exec = () => {
			return chai.request(serv)
			  .get('/api/users/verify/'+id);
		  
		}
		
		beforeEach((done) => {
			
		
			  
			const user = new User({ firstName: 'first1' , lastName: 'last1', email: 'first3@gmail.com', password: '12345678',phoneNumber: '09589884488'});
			
			id=user._id;
			user.save().then(done());
			
		});
		
		it('should return 404 if invalid id is passed',(done) => {
			
			id = '1';
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('A user with this email address is not found!');
				done();
			});
			
		});
		
		it('should return 404 if user with the given id is not found',(done) => {
			
			id = mongoose.Types.ObjectId();
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('A user with this email address is not found!');
				done();
			}); 
		});
			
		it('should return 200 and {id: objectid}',(done) => {
			
			
			exec().end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('id').eql(id.toHexString());

				done();
			}); 
			
		});
	});
	
  describe('POST /', () => {
		let user;
		 const exec = (user) => {
		
     
		return chai.request(serv)
		  .post('/api/users')
		  .send(user)
		  
		}
		
	 
		beforeEach((done) => {
			
			  
			user = { firstName: 'first4' , lastName: 'last4', email: 'first4@gmail.com', password: '12345678',phoneNumber: '09589884484'};
			
			done();
			
		});
		
		
		
		
		it('should return 400 if firstName is less than 3 characters',(done) => {
			user.firstName = 'fi';
			
			exec(user).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"firstName" length must be at least 3 characters long');
				done();
			});
		});
	
		it('should return 400 if firstName is greater than 50 characters',(done) => {
			user.firstName = new Array(52).join('a');

			exec(user).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"firstName" length must be less than or equal to 50 characters long');
				done();
			});
			
		});
		
		it('should return 400 if firstName is missing',(done) => {
			user = {lastName: 'last4', email: 'first4@gmail.com', password: '12345678',phoneNumber: '09589884484'}
			
			exec(user).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"firstName" is required');
				done();
			}); 
			
		});
		
		it('should return 400 if a user with the same email address is registered',(done) => {
			userr = new User(user);
			userr.save().then();
		
			
			exec(user).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error');
				res.error.should.have.property('text').eql('User is already registered');
				done();
			}); 
			
		});
		
		it('should return 201 and the user if valid',(done) => {
		
			
			exec(user).end((err, res) => {
				res.should.have.status(201);
				res.body.should.be.a('object')
				res.body.should.have.property('firstName').eql(user.firstName);
				done();
			}); 
			
		});
  });
 
  describe('POST /forget', () => {
		let email;
		let fund;
		 const exec = () => {
		
     
		return chai.request(serv)
		  .post('/api/users/forget')
		  .send(email);
		  
		}
		
	 
		beforeEach((done) => {
			
			 user = new User({firstName: 'first1' , lastName: 'last1', email: 'hananmohsin967088@gmail.com',password: '12345678',phoneNumber: '0958994488', isAdmin: true});
			email = {email: 'hananmohsin967088@gmail.com'};
			user.save().then(done());	
		});
	
		
		it('should return 400 if the body is empty',(done) => {
			
			email = {};
			exec().end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('An empty body is not allowed');
				done();
			});
		});
		
		it('should return 404 if a user with the given email address is not found',(done) => {
			email = {email: 'something@gmail.com'};
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('A user with this email address is not found!');
				done();
			}); 
			
		});
	
	
		
		it('should return 200 and the id of the email address user',(done) => {
			
			exec().end((err, res) => {
				res.should.have.status(200);
				//res.body.should.be.eql('sent')
				done();
			}); 
			
		});
  });
  
  
  
  
	describe('PUT /me', () => {
		let userr;
		let token;
		 const exec = (user) => {
		
     
		return chai.request(serv)
		  .put('/api/users/me')
		  .set('x-auth-token', token)
		  .send(user)
		  
		}
		
	 
		beforeEach((done) => {
			
			 userr = { firstName: 'first1' , lastName: 'last1', email: 'first3@gmail.com', password: '12345678',phoneNumber: '09589884488'};
			const user = new User({ firstName: 'first1' , lastName: 'last1', email: 'first3@gmail.com', password: '12345678',phoneNumber: '09589884488'});
			
			token = user.generateAuthToken();  
			user.save().then(done());
			
		});
		
		
		it('should return 401 if client is not logged in',(done) => {
			token = ''; 
			exec().end((err, res) => {
				res.should.have.status(401);
				done();
			});
		});
	
		it('should return 404 if the user is not found',(done) => {
			token = new User({ isAdmin: false }).generateAuthToken(); 

			exec().end((err, res) => {
				res.should.have.status(404);
				done();
			});
			
		});
		
		
		it('should return 400 if firstName is less than 3 characters',(done) => {
			userr.firstName = 'fi';
			
			exec(userr).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"firstName" length must be at least 3 characters long');
				done();
			});
		});
	
		it('should return 400 if firstName is greater than 50 characters',(done) => {
			userr.firstName = new Array(52).join('a');

			exec(userr).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"firstName" length must be less than or equal to 50 characters long');
				done();
			});
			
		});
		
		it('should return 400 if firstName is missing',(done) => {
			userr = {lastName: 'last4', email: 'first4@gmail.com', password: '12345678',phoneNumber: '09589884484'}
			
			exec(userr).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"firstName" is required');
				done();
			}); 
			
		});
		
		it('should return 200 and the updated user if valid',(done) => {
		
			userr.firstName = 'firstNamelala';
			exec(userr).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object')
				res.body.should.have.property('firstName').eql(userr.firstName);
				done();
			}); 
			
		});
		
  });
  
  describe('PUT /reset/:id', () => {
		let id;
		let password;
		let user;
		
		 const exec = () => {
			return chai.request(serv)
			  .put('/api/users/reset/'+id)
			  .send(password)
			  
		}
		
	 
		beforeEach((done) => {
			
			 user = new User({ firstName: 'first1' , lastName: 'last1', email: 'first3@gmail.com', password: '12345678',phoneNumber: '09589884488'});
			
			id = user._id;
			password = {password: '12345678'};
			user.save().then(done());
			
		});
		
		it('should return 404 if invalid id is passed',(done) => {
			
			id = '1';
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('A user with this id is not found!');
				done();
			});
			
		});
		
		it('should return 404 if user with the given id is not found',(done) => {
			id = mongoose.Types.ObjectId();
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('A user with this id is not found!');
				done();
			}); 
		});
		
		it('should return 400 if the body is empty',(done) => {
			
			password = {};
			exec().end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('An empty body is not allowed');
				done();
			});
		});
		
		it('should return 200 and the user',(done) => {
			
			
			exec().end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('firstName').eql(user.firstName);

				done();
			}); 
			
		});
		
  });
  
  describe('DELETE /me', () => {
		let token;
		 const exec = () => {
		
     
		return chai.request(serv)
		  .delete('/api/users/me')
		  .set('x-auth-token', token);
		  
		}
		
		before(() => {
			
			
		});
	 
		beforeEach((done) => {
			
			const user = new User({ firstName: 'first1' , lastName: 'last1', email: 'first3@gmail.com', password: '12345678',phoneNumber: '09589884488'});
			
			token = user.generateAuthToken();  
			user.save().then(done());
			
		});
		
		
		it('should return 401 if client is not logged in',(done) => {
			token = ''; 
			exec().end((err, res) => {
				res.should.have.status(401);
				done();
			});
		});
	
		it('should return 404 if the user is not found',(done) => {
			token = new User({ isAdmin: false }).generateAuthToken(); 

			exec().end((err, res) => {
				res.should.have.status(404);
				done();
			});
			
		});
		
			
		it('should return 200 if the user is deleted',(done) => {
		
			exec().end((err, res) => {
				res.should.have.status(200);
				res.should.have.property('text').eql('User is deleted');
				done();
			}); 
			
		});
		
  });

  
  

	
	
}); 