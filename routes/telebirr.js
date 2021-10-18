const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const timestamp = require('unix-timestamp');
const { v4: uuidv4 } = require('uuid');

const http = require('http')
const fetch = require('node-fetch');

// sent form web app
router.post('/pay', async(req, res) => {

    // validate request

    // send request to telebirr server
    // axios.post("http://196.188.120.3:11443/ammapi/service-openup/toTradeWebPay",
    //     {
    //         "appId": "4347b88db6e64e0baa9e588acd42d50c",
    //         "timestamp": timestamp.now().toString(),
    //         "nonce": uuidv4(),
    //         "returnUrl": req.body.returnUrl,
    //         "notifyUrl": "http://highlight-group.com/api/telebirr/result",
    //         "subject": req.body.subject,
    //         "outTradeNo": uuidv4(),
    //         "timeoutExpress": "5",
    //         "totalAmount": req.body.totalAmount,
    //         "shortCode": "410028",
    //         "receiveName": "Highlight Software Design",
    //     }
    // ).then((response) => {
    //     res.send(response.data)
    // }).catch((error) => {
    //     res.send(error)
    // });

    // const teleReq = http.request("http://196.188.120.3:11443/ammapi/service-openup/toTradeWebPay",
    //     {
    //         method: "POST",
    //         data: {
    //             "appId": "4347b88db6e64e0baa9e588acd42d50c",
    //             "timestamp": timestamp.now().toString(),
    //             "nonce": uuidv4(),
    //             "returnUrl": req.body.returnUrl,
    //             "notifyUrl": "highlight-group.com/api/telebirr/result",
    //             "subject": req.body.subject,
    //             "outTradeNo": uuidv4(),
    //             "timeoutExpress": "5",
    //             "totalAmount": req.body.totalAmount,
    //             "shortCode": "410028",
    //             "receiveName": "Highlight Software Design",
    //         },
    //         timeout: 300000
    //     },
    //     (response) => {
    //         res.send(response.data)
    //     },
    // )


    // teleReq.on('error', error => {
    //     res.send(error)
    // })

    console.log(`pay: ${req.body}`)


    const body = {
        "appId": "4347b88db6e64e0baa9e588acd42d50c",
        "timestamp": timestamp.now().toString(),
        "nonce": uuidv4(),
        "returnUrl": req.body.returnUrl,
        "notifyUrl": "highlight-group.com/api/telebirr/pay",
        "subject": req.body.subject,
        "outTradeNo": uuidv4(),
        "timeoutExpress": "5",
        "totalAmount": req.body.totalAmount,
        "shortCode": "410028",
        "receiveName": "Highlight Software Design",
    };

    try {
        const response = await fetch("http://196.188.120.3:11443/ammapi/service-openup/toTradeWebPay", {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
    
        res.send(data);
    } catch (error) {
        res.send(`Error: ${error}`)
    }
   

})

// sent from telebirr server
router.post('/result', (req, res) => {

    console.log(`result: ${req.body}`)
    res.send(req.body)
})


module.exports = router;