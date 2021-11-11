const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const timestamp = require('unix-timestamp');
const { v4: uuidv4 } = require('uuid');

const http = require('http')
const fetch = require('node-fetch');
const crypto = require('crypto')
const fs = require('fs')
const NodeRSA = require('node-rsa');


// sent form web app
router.post('/pay', async (req, res) => {

    // validate request

    console.log(`pay: ${JSON.stringify(req.body)}`)

    const appKey = 'ffbf324b21974d778cec063f17aa1367';
    let signObj = {
        "appId": "4347b88db6e64e0baa9e588acd42d50c",
        "nonce": uuidv4(),
        "notifyUrl": "178.62.55.81/api/telebirr/result",
        "outTradeNo": uuidv4(),
        "returnUrl": req.body.returnUrl,
        "shortCode": "410028",
        "subject": req.body.subject,
        "timeoutExpress": "30",
        "timestamp": timestamp.now().toString(),
        "totalAmount": req.body.totalAmount,
        "receiveName": "Highlight Software Design",
    };
    signObj.appKey = appKey;
    let stringA = jsonSort(signObj);

    console.log(`stringA: ${stringA}`)

    let stringB = sha256(stringA);

    let sign = stringB.toUpperCase()

    let ussdjson = JSON.stringify(signObj);

    console.log(`ussdJson: ${ussdjson}`)

    let publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOtOlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9ZlxSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYisokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBbey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBqNFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZV/TRpOD3QIDAQAB";

    let ussd = rsa_encrypt(ussdjson, publicKey);

    let requestMessage = { appid: signObj.appId, sign: sign, ussd: ussd };

    console.log(`request: ${JSON.stringify(requestMessage)}`);


    try {
        const response = await fetch("http://196.188.120.3:11443/service-openup/toTradeWebPay", {
            method: 'post',
            body: JSON.stringify(requestMessage),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log(`response: ${data}`)

        res.send(data);
    } catch (error) {
        res.send(`Error: ${error}`)
    }


})


// sent form web app
router.post('/payMobile', async (req, res) => {

    // validate request

    console.log(`pay: ${JSON.stringify(req.body)}`)


    const appKey = 'ffbf324b21974d778cec063f17aa1367';
    let signObj = {
        "appId": "4347b88db6e64e0baa9e588acd42d50c",
        "nonce": uuidv4(),
        "notifyUrl": "http://highlight-group.com/api/telebirr/pay",
        "outTradeNo": uuidv4(),
        "shortCode": "410028",
        "subject": req.body.subject,
        "timeoutExpress": "30",
        "timestamp": timestamp.now().toString(),
        "totalAmount": req.body.totalAmount,
        "receiveName": "Highlight Software Design",
        // "returnApp": { "PackageName": "cn.tydic.ethiopay", "Activity": "cn.tydic.ethiopay.PayForOtherAppActivity" }
        "returnApp": "com.legas.app"
    };
    signObj.appKey = appKey;
    let stringA = jsonSort(signObj);

    console.log(`stringA: ${stringA}`)
    console.log(`returnApp= { "PackageName": "cn.tydic.ethiopay", "Activity": "cn.tydic.ethiopay.PayForOtherAppActivity" }`)

    let stringB = sha256(stringA);

    let sign = stringB.toUpperCase()

    let ussdjson = JSON.stringify(signObj);

    console.log(`ussdJson: ${ussdjson}`)

    let publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOtOlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9ZlxSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYisokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBbey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBqNFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZV/TRpOD3QIDAQAB";

    let ussd = rsa_encrypt(ussdjson, publicKey);

    let requestMessage = { appid: signObj.appId, sign: sign, ussd: ussd };

    console.log(`request: ${JSON.stringify(requestMessage)}`);


    try {
        const response = await fetch("http://196.188.120.3:11443/service-openup/toTradeMobielPay", {
            method: 'post',
            body: JSON.stringify(requestMessage),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log(`response: ${data}`)

        res.send(data);
    } catch (error) {
        res.send(`Error: ${error}`)
    }


})



// sent from telebirr server
router.post('/result', (req, res) => {

    console.log(`result: ${req.body}`)
    res.send(req.body)
    // must create donation object here
})


//*************helper functions */

// sort the parameters in alphabetical order and add = and & between them
function jsonSort(jsonObj) {
    let arr = [];
    for (var key in jsonObj) {
        arr.push(key);
    }
    arr.sort();
    let str = '';
    for (var i in arr) {
        if(arr[i] == "returnApp"){
            console.log('in return app')
            str += arr[i] + "=" + jsonObj[arr[i]].toString() + "&";
        }else{
            str += arr[i] + "=" + jsonObj[arr[i]] + "&";
        }
    }
    return str.substr(0, str.length - 1);
}

// create a hash of body
function sha256(data) {
    var hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

const rsa_encrypt = (data, publicKey) => {
    let key = new NodeRSA(getPublicKey(publicKey));
    key.setOptions({ encryptionScheme: 'pkcs1' });
    let encryptKey = key.encrypt(data, 'base64');
    return encryptKey;
}

function insertStr(str, insertStr, sn) {
    var newstr = '';
    for (var i = 0; i < str.length; i += sn) {
        var tmp = str.substring(i, i + sn);
        newstr += tmp + insertStr;
    }
    return newstr;
}

const getPublicKey = function (key) {
    const result = insertStr(key, '\n', 64);
    return '-----BEGIN PUBLIC KEY-----\n' + result + '-----END PUBLIC KEY-----';
};


module.exports = router;