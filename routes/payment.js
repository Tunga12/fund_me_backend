const paypal = require('paypal-rest-sdk');
const express = require('express');
const router = express();
const {Donation, validate} = require('../models/donation');
const {auth} = require('../middleware/auth');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AZLAQwsNZZ9A1py3JbnTJui1eGFrqyg5NJopKEeYo4gW03F-YgIR3i3YV2ly9Ct3rdeeddSbLjrRNGeV',
    'client_secret': 'EEzN0bZC_PTcjIkjBQi0siBEDw4WY6KR8YeHiV3dPwh6KVMlBPUCp1JQDrvvddakC0yGRHOL8rAr2KOe'
});

var total;

router.post('/pay/:fid', auth,(req, res) => {
    req.body.userId = req.user._id;
    req.target = req.params.fid;
    const {error} = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

    const donation = new Donation(req.body);

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/donation/success",
            "cancel_url": "http://localhost:3000/donation/cancel"
        },
        "transactions": [{
            "donation_list": {
                "donations": [{
                    "amount": donation.amount.toString(),
                    "tip": donation.tip.toString(),
                    "comment": donation.comment,
                }]
            },
            "amount": {
                "currency": "USD",
                "total": (parseInt(donation.amount) + parseInt(donation.tip)).toString()
            },
            "description": "This is the payment for donation."
        }]
    };


    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0 ;i < payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                    total = (parseInt(req.body.amount) + parseInt(req.body.tip)).toString()
                    console.log(payment.links[i].href);
                    res.redirect(payment.links[i].href);
                    
                    
            
                }
            }
        }
    });
});

router.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id" : payerId,
        "transactions" : [{
            "amount": {
                "currency": "USD",
                "total": total
            }
        }]
    }

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment){
        if(error){
            console.log(error.response);
            throw error;
        }else{
            res.send(true);
        }
    });

});

router.get('/cancel', (req, res) => {
    res.send(false);

});

module.exports = router;