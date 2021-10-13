const winston = require('winston');
const nodeCron = require("node-cron");
const mongoose = require("mongoose");
const {Fundraiser} = require('../models/fundraiser');
const {Donation} = require('../models/donation');
const {Notification} = require('../models/notification');
const {newNotification} = require('../startup/connection');

async function scheduler(){
	var totalRaisedB = 0;
	var totalRaisedD=0;
	var counter = 0;
	let funds = await Fundraiser.find({isDeleted:false, isPublished: true});

	funds.forEach(async(fund) => {
		fund.donations.forEach(async(donation) => {
			
			let donat = await Donation.findById(donation);
			var date1 = new Date(donat.date).setHours(0,0,0,0);
			var date2 = new Date().setHours(0,0,0,0);
			counter ++;
			if(date1.valueOf() === date2.valueOf()){
				
				if(donat.paymentMethod.toLowerCase() === 'paypal'){ 
				winston.info("paypal");
					totalRaisedD += donat.amount;
				}else{
					totalRaisedB += donat.amount;
				}
			}
			
			if(counter == fund.donations.length){
			
				counter = 0;
				if(totalRaisedD !== 0 || totalRaisedB !==0){
					var recp = [];
					recp.push(fund.organizer);
				  
					const newNot = new Notification({
						notificationType:'Donation',
						recipients: recp,
						title:`${fund.title}[Donation]`,
						content: `A total amount of money donated today is ${totalRaisedD}dollar and ${totalRaisedB}birr.'`,
						target: fund._id
						
					});
					totalRaisedB = 0;
					totalRaisedD = 0;
				    await newNotification(newNot);
				}
			}
		});
		
		   
	});
  


}

module.exports.scheduler = scheduler;