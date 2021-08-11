/* process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const {User} = require('../models/user');
const {Donation} = require('../models/donation');
const {Fundraiser} = require('../models/fundraiser');
const {Category} = require('../models/category');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server;
let should = chai.should();

const serv = 'http://localhost:3000';
chai.use(chaiHttp);

describe('/api/donations', () => {
	before(() => { server = require('../index');});
	
	afterEach((done) => { 
		User.deleteMany({}).then();
		Category.deleteMany({}).then();
		Fundraiser.deleteMany({}).then();
		Donation.deleteMany({})
		.then(done())
		.catch((err) => console.log((err)=> console.log('Error updates: ',err)));
		
		//server.close(); 
	});

	
  
	describe('GET /', () => {
		let token; 
		 const exec = () => {
		
     
		return chai.request(serv)
		  .get('/api/donations')
		  .set('x-auth-token', token);
		  
		}
		
	
	 
		
		
		
		
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
		
		it('should return all donations',(done) => {
			const user = new User({firstName: 'first1' , lastName: 'last1', email: 'first1@gmail.com', password: '12345678',phoneNumber: '0958994488', isAdmin: true});

			user.save().then();
			token = user.generateAuthToken(); 
			const donations = [
			{userId: user._id, amount: 1000, tip: 50, comment: 'hghgjhgjhjhhjkgjkfjgk'},
			{userId: user._id, amount: 20000, tip: 1000,comment: 'some other comment'}
			];
			  
			Donation.collection.insertMany(donations).then();
			exec().end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
                res.body.length.should.be.eql(2);
				res.body[0].should.have.property('amount').eql(1000);

				done();
			}); 
			
		});
    });
 
  	describe('GET /api/donations/:id', () => {
		
		 const exec = (id) => {
		
     
		return chai.request(serv)
		  .get('/api/donations/'+id);
		  
		}	
		
		it('should return 200 and the donation if id is valid',(done) => {
			const user = new User({firstName: 'first1' , lastName: 'last1', email: 'first1@gmail.com', password: '12345678',phoneNumber: '0958994488', isAdmin: true});

			user.save().then();
	
			const donation = new Donation({userId: user._id, amount: 1000, tip: 50, comment: 'hghgjhgjhjhhjkgjkfjgk'});
			donation.save().then();
			exec(donation._id.toString()).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('amount').eql(donation.amount);
				done();
			});
		});
	
		it('should return 404 if invalid id is passed',(done) => {
			token = new User({ isAdmin: false }).generateAuthToken(); 

			exec('1').end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('Donation with the given ID was not found.');
				done();
			});
			
		});
		
		it('should return 404 if a donation with the given id is not found',(done) => {
			
			const id = mongoose.Types.ObjectId();
			exec(id).end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('Donation with the given ID was not found.');
				done();
			}); 
			
		});
  });
  
  describe('POST /:fid', () => {
		let donation;
		let token;
		let fid;
		 const exec = () => {
		
     
		return chai.request(serv)
		  .post('/api/donations/'+fid)
		  .set('x-auth-token', token)
		  .send(donation)
		  
		}
		
	 
		beforeEach((done) => {
			
			const user = new User({firstName: 'first1' , lastName: 'last1', email: 'first1@gmail.com', password: '12345678',phoneNumber: '0958994488', isAdmin: true});

			user.save().then();
			token = user.generateAuthToken();
			const cat = new Category({name: 'Accident'});
			cat.save().then();
			
		const fund = new Fundraiser({title: 'fund me',story:'I need help as soon as possible', goalAmount: 1000, category: cat._id, image: 'https://image.com', organizer: user._id, location: {longitude: '55664', latitude: '546656'}});
		fund.save().then();
		fid = fund._id;
			donation = {userId: user._id,tip: 50, comment: 'hghgjhgjhjhhjkgjkfjgk'};
			done();
			
		});
		
		
		it('should return 401 if client is not logged in',(done) => {
			token = ''; 

			exec().end((err, res) => {
				res.should.have.status(401);
				done();
			});
			
		});
		
		it('should return 404 if invalid fundraiser id is passed',(done) => {
			donation.amount = 1000;
			fid = '1';
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('A fundraiser with the given ID was not found');
				done();
			});
			
		});
		
		it('should return 404 if a fundraiser with the given id is not found',(done) => {
			donation.amount = 1000;
			fid = mongoose.Types.ObjectId();
			exec(donation).end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('A fundraiser with the given ID was not found');
				done();
			}); 
			
		});
		
		it('should return 400 if amount is missing',(done) => {
		
			exec(donation).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"amount" is required');
				done();
			}); 
			
		});
	
		
		
		it('should return 201 and the donation if valid',(done) => {
			donation.amount = 1000;
			
			exec(donation).end((err, res) => {
				res.should.have.status(201);
				res.body.should.be.a('object')
				res.body.should.have.property('amount').eql(donation.amount);
				done();
			}); 
			
		});
  });
  
	describe('PUT /:id', () => {
		let id;
		let token;
		let donationn;
		 const exec = () => {
		
     
		return chai.request(serv)
		  .put('/api/donations/'+id)
		  .set('x-auth-token', token)
		  .send(donationn)
		  
		}
		
		before(() => {
			
			
		});
	 
		beforeEach((done) => {
			
			const user = new User({firstName: 'first1' , lastName: 'last1', email: 'first1@gmail.com', password: '12345678',phoneNumber: '0958994488', isAdmin: true});

			user.save().then();
			token = user.generateAuthToken();
			const cat = new Category({name: 'Accident'});
			cat.save().then();
			
			const fund = new Fundraiser({title: 'fund me',story:'I need help as soon as possible', goalAmount: 1000, category: cat._id, image: 'https://image.com', organizer: user._id, location: {longitude: '55664', latitude: '546656'}});
			fund.save().then();
		
			donationn = {userId: user._id,tip: 50, comment: 'hghgjhgjhjhhjkgjkfjgk'};
			const donation = new Donation({userId: user._id,amount:1000,tip: 50, comment: 'some other comment'});
			id = donation._id;
			donation.save().then(done());
			
			
			
		});
		
		
		it('should return 401 if client is not logged in',(done) => {
			token = ''; 
			exec().end((err, res) => {
				res.should.have.status(401);
				done();
			});
		});
	
		
		
		
		it('should return 400 if amount is missing',(done) => {
			
			
			exec().end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"amount" is required');
				done();
			});
		});
		
		it('should return 404 if invalid id is passed',(done) => {
			id = '1';
			donationn.amount = 2000;
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('Donation with the given ID was not found.');
				done();
			});
			
		});
		
		it('should return 404 if donation with the given id is not found',(done) => {
			donationn.amount = 2000;
			id = mongoose.Types.ObjectId();
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('Donation with the given ID was not found.');
				done();
			}); 
			
		});
		
		it('should return 200 and the donation if the update is updated',(done) => {
			donationn.amount = 2000;
			exec().end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object')
				res.body.should.have.property('amount').eql(donationn.amount);
				done();
			}); 
			
		});
	
		
		
	});

	describe('DELETE /:id', () => {
		let token;
		let id;
		 const exec = () => {
		
     
		return chai.request(serv)
		  .delete('/api/donations/'+id)
		  .set('x-auth-token', token);
		  
		}
		
		
	 
		beforeEach((done) => {
			
			const user = new User({firstName: 'first1' , lastName: 'last1', email: 'first1@gmail.com', password: '12345678',phoneNumber: '0958994488', isAdmin: true});

			user.save().then();
			token = user.generateAuthToken();
			const cat = new Category({name: 'Accident'});
			cat.save().then();
			
			const fund = new Fundraiser({title: 'fund me',story:'I need help as soon as possible', goalAmount: 1000, category: cat._id, image: 'https://image.com', organizer: user._id, location: {longitude: '55664', latitude: '546656'}});
			fund.save().then();
		
			const donation = new Donation({userId: user._id,amount:1000,tip: 50, comment: 'some other comment'});
			id = donation._id;
			donation.save().then(done());
			
		});
		
		
		it('should return 401 if client is not logged in',(done) => {
			token = ''; 
			exec().end((err, res) => {
				res.should.have.status(401);
				done();
			});
		});
	
		it('should return 404 if invalid id is passed',(done) => {
			id = '1';

			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('Donation with the given ID was not found.');
				done();
			});
			
		});
		
		it('should return 404 if donation with the given id is not found',(done) => {
			
			id = mongoose.Types.ObjectId();
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('Donation with the given ID was not found.');
				done();
			}); 
			
		});
		
			
		it('should return 200 if the donation is deleted',(done) => {
		
			exec().end((err, res) => {
				res.should.have.status(200);
				res.should.have.property('text').eql('Donation is deleted');
				done();
			}); 
			
		});
		
	});
	
	
}); */