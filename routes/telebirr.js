const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const timestamp = require('unix-timestamp');
const { v4: uuidv4 } = require('uuid');

// sent form web app
router.post('/pay', (req, res) => {

    // validate request

    // send request to telebirr server
    axios.post("http://196.188.120.3:11443/ammapi/service-openup/toTradeWebPay",
        {
            "appId": "4347b88db6e64e0baa9e588acd42d50c",
            "timestamp": timestamp.now(),
            "nonce": uuidv4(),
            "returnUrl": req.body.returnUrl,
            "notifyUrl": "legas.highlight-group.com/api/telebirr/result",
            "subject": req.body.subject,
            "outTradeNo": uuidv4(),
            "timeoutExpress": "5",
            "totalAmount": req.body.totalAmount,
            "shortCode": "410028",
            "receiveName": "Highlight Software Design",
        },
    ).then((response) => {
        res.send(response.data)
    }).catch((error) => {
        res.send(error)
    });


})

// sent from telebirr server
router.post('/result', (req, res) => {

})


module.exports = router;