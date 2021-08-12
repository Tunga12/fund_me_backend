 process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const {User} = require('../models/user');
const {Update} = require('../models/update');
const {Fundraiser} = require('../models/fundraiser');
const {Category} = require('../models/category');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server;
let should = chai.should();

const serv = 'http://localhost:3000';
chai.use(chaiHttp);

describe('/api/updates', () => {
	before(() => { server = require('../index');});
	
	afterEach((done) => { 
		User.deleteMany({}).then();
		Category.deleteMany({}).then();
		Fundraiser.deleteMany({}).then();
		Update.deleteMany({})
		.then(done())
		.catch((err) => console.log((err)=> console.log('Error updates: ',err)));
		
		//server.close(); 
	});

	
  
	describe('GET /', () => {
		let token; 
		 const exec = () => {
		
     
		return chai.request(serv)
		  .get('/api/updates')
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
		
		it('should return all updates',(done) => {
			const user = new User({firstName: 'first1' , lastName: 'last1', email: 'first1@gmail.com', password: '12345678',phoneNumber: '0958994488', isAdmin: true});

			user.save().then();
			token = user.generateAuthToken(); 
			const updates = [
			{userId: user._id, content: 'some other update'},
			{userId: user._id, content: 'some other update2'}
			];
			  
			Update.collection.insertMany(updates).then();
			exec().end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('array');
                res.body.length.should.be.eql(2);
				res.body[0].should.have.property('content').eql('some other update');

				done();
			}); 
			
		});
    });
  
  	describe('GET /api/updates/:id', () => {
		
		 const exec = (id) => {
		
     
		return chai.request(serv)
		  .get('/api/updates/'+id);
		  
		}	
		
		it('should return 200 and the update if id is valid',(done) => {
			const user = new User({firstName: 'first1' , lastName: 'last1', email: 'first1@gmail.com', password: '12345678',phoneNumber: '0958994488', isAdmin: true});

			user.save().then();
	
			const update = new Update({userId: user._id, content: 'some other update'});
			update.save().then();
			exec(update._id.toString()).end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('content').eql(update.content);
				done();
			});
		});
	
		it('should return 404 if invalid id is passed',(done) => {
			token = new User({ isAdmin: false }).generateAuthToken(); 

			exec('1').end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('An update with the given ID was not found.');
				done();
			});
			
		});
		
		it('should return 404 if update with the given id is not found',(done) => {
			
			const id = mongoose.Types.ObjectId();
			exec(id).end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('An update with the given ID was not found.');
				done();
			}); 
			
		});
  });
  
  describe('POST /:fid', () => {
		let update;
		let token;
		let fid;
		 const exec = () => {
		
     
		return chai.request(serv)
		  .post('/api/updates/'+fid)
		  .set('x-auth-token', token)
		  .send(update)
		  
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
			update = {content: 'some other update'};
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
			fid = '1';
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('A fundraiser with the given ID was not found');
				done();
			});
			
		});
		
		it('should return 404 if a fundraiser with the given id is not found',(done) => {
			
			fid = mongoose.Types.ObjectId();
			exec(update).end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('A fundraiser with the given ID was not found');
				done();
			}); 
			
		});
		
		it('should return 400 if content is missing',(done) => {
		
			update.content='';
			exec(update).end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"content" is not allowed to be empty');
				done();
			}); 
			
		});
	
		
		
		it('should return 201 and the update if valid',(done) => {
		
			
			exec(update).end((err, res) => {
				res.should.have.status(201);
				res.body.should.be.a('object')
				res.body.should.have.property('content').eql(update.content);
				done();
			}); 
			
		});
  });
  
	describe('PUT /:id', () => {
		let id;
		let token;
		let updatee;
		 const exec = () => {
		
     
		return chai.request(serv)
		  .put('/api/updates/'+id)
		  .set('x-auth-token', token)
		  .send(updatee)
		  
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
		
			updatee = {content: 'some another update'};
			const update = new Update({userId: user._id, content: 'some other update'});
			id = update._id;
			update.save().then(done());
			
			
			
		});
		
		
		it('should return 401 if client is not logged in',(done) => {
			token = ''; 
			exec().end((err, res) => {
				res.should.have.status(401);
				done();
			});
		});
	
		
		
		
		it('should return 400 if content is missing',(done) => {
			updatee.content = '';
			
			exec().end((err, res) => {
				res.should.have.status(400);
				res.should.have.property('error')
				res.error.should.have.property('text').eql('"content" is not allowed to be empty');
				done();
			});
		});
		
		it('should return 404 if invalid id is passed',(done) => {
			id = '1';

			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('An update with the given ID was not found.');
				done();
			});
			
		});
		
		it('should return 404 if update with the given id is not found',(done) => {
			
			id = mongoose.Types.ObjectId();
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('An update with the given ID was not found.');
				done();
			}); 
			
		});
		
		it('should return 200 and the update if the update is updated',(done) => {
		
			exec().end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object')
				res.body.should.have.property('content').eql(updatee.content);
				done();
			}); 
			
		});
	
		
		
	});
 
	describe('DELETE /:id', () => {
		let token;
		let id;
		 const exec = () => {
		
     
		return chai.request(serv)
		  .delete('/api/updates/'+id)
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
		
			const update = new Update({userId: user._id, content: 'some other update'});
			id = update._id;
			update.save().then(done());
			
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
				res.should.have.property('text').eql('An update with the given ID was not found.');
				done();
			});
			
		});
		
		it('should return 404 if update with the given id is not found',(done) => {
			
			id = mongoose.Types.ObjectId();
			exec().end((err, res) => {
				res.should.have.status(404);
				res.should.have.property('text').eql('An update with the given ID was not found.');
				done();
			}); 
			
		});
		
			
		it('should return 200 if the update is deleted',(done) => {
		
			exec().end((err, res) => {
				res.should.have.status(200);
				res.should.have.property('text').eql('Update is deleted');
				done();
			}); 
			
		});
		
	});
	
	
}); 