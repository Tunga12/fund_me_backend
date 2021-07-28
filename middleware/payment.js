const paypal = require('paypal-rest-sdk');
const express = require('express');
const router = express();
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AZLAQwsNZZ9A1py3JbnTJui1eGFrqyg5NJopKEeYo4gW03F-YgIR3i3YV2ly9Ct3rdeeddSbLjrRNGeV',
    'client_secret': 'EEzN0bZC_PTcjIkjBQi0siBEDw4WY6KR8YeHiV3dPwh6KVMlBPUCp1JQDrvvddakC0yGRHOL8rAr2KOe'
});
var total;
function payment(req,res,next){
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
                    "amount": req.body.amount.toString(),
                    "tip": req.body.tip.toString(),
                    "comment": req.body.comment,
                }]
            },
            "amount": {
                "currency": "USD",
                "total": (parseInt(req.body.amount) + parseInt(req.body.tip)).toString()
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
}


module.exports = {
    payment: payment,
    status: router
}
