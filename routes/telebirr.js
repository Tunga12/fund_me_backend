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
        "notifyUrl": "highlight-group.com/api/telebirr/pay",
        "outTradeNo": uuidv4(),
        "returnUrl": req.body.returnUrl,
        "shortCode": "410028",
        "subject": req.body.subject,
        "timeoutExpress": "5",
        "timestamp": timestamp.now().toString(),
        "totalAmount": req.body.totalAmount,
        "receiveName": "Highlight Software Design",
    };
    signObj.appKey = appKey;
    let stringA = jsonSort(signObj);

    let stringB = sha256(stringA);

    let sign = stringB.toUpperCase()

    let ussdjson = JSON.stringify(signObj);

    let publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOtOlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9ZlxSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYisokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBbey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBqNFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZV/TRpOD3QIDAQAB";

    let ussd = rsa_encrypt(ussdjson, publicKey);

    let requestMessage = { appid: signObj.appId, sign: sign, ussd: ussd };


    try {
        const response = await fetch("http://196.188.120.3:11443/service-openup/toTradeWebPay", {
            method: 'post',
            body: requestMessage,
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        res.send(data);
    } catch (error) {
        res.send(`Error: ${error}`)
    }


})

// // sent form web app
// router.post('/pay', async (req, res) => {

//     // validate request

//     console.log(`pay: ${JSON.stringify(req.body)}`)

//     let body = {
//         "appid": "4347b88db6e64e0baa9e588acd42d50c",
//         "appKey": "ffbf324b21974d778cec063f17aa1367",
//         "nonce": uuidv4(),
//         "notifyUrl": "highlight-group.com/api/telebirr/pay",
//         "outTradeNo": uuidv4(),
//         "returnUrl": req.body.returnUrl,
//         "shortCode": "410028",
//         "subject": req.body.subject,
//         "timeoutExpress": "5",
//         "timestamp": timestamp.now().toString(),
//         "totalAmount": req.body.totalAmount,
//         "receiveName": "Highlight Software Design",
//     };


//     // let publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOtOlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9ZlxSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYisokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBbey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBqNFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZV/TRpOD3QIDAQAB";
//     // let publicKey =  fs.readFileSync("./public_key", "utf8");
//     // let publicKey = "-----BEGIN PUBLIC KEY-----\n" +
//     //     "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOtOlInG\n" +
//     //     "EzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9ZlxSbsU2\n" +
//     //     "/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYisokU2\n" +
//     //     "QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBbey5PJdLV\n" +
//     //     "GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBqNFcqBRp\n" +
//     //     "86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZV/TRpOD3\n" +
//     //     "QIDAQAB\n" +
//     //     "-----END PUBLIC KEY-----\n";


//     const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
//         // The standard secure default length for RSA keys is 2048 bits
//         modulusLength: 2048,
//     });
//     console.log(publicKey)


//     // generate ussd
//     // let uusd = crypto.createHmac('rsa2048', publicKey).update(JSON.stringify(body)).digest('base64');
//     let ussd = crypto.publicEncrypt(
//         {
//             key: publicKey,
//             padding: crypto.constants.RSA_NO_PADDING,
//             oaepHash: "rsa2048"
//         },
//         Buffer.from(JSON.stringify(body)))
//     // .toString("base64");

//     // parameter order should be alphabetical
//     // let stringA = '';

//     // Object.entries(body).forEach((entry) => {
//     //     // console.log(entry)
//     //     let key = entry[0];
//     //     let value = entry[1];
//     //     stringA = stringA.concat(`${key}=${value}&`)
//     // });

//     // stringA = stringA.slice(0, -1)

//     // console.log(`stringA: ${stringA}`)

//     // let sign = crypto.createHmac('sha256', publicKey).update(stringA).digest('base64');
//     // let privateKey = crypto.createPrivateKey('telebirr');
//     // console.log(privateKey);
//     // let sign = crypto.sign('sha256', Buffer.from(stringA), { key: publicKey }).toString("base64");

//     body.ussd = ussd;
//     // body.sign = sign;
//     console.log(body);

//     try {
//         const response = await fetch("http://196.188.120.3:11443/service-openup/toTradeWebPay", {
//             method: 'post',
//             body: JSON.stringify(body),
//             headers: { 'Content-Type': 'application/json' }
//         });
//         const data = await response.json();

//         res.send(data);
//     } catch (error) {
//         res.send(`Error: ${error}`)
//     }


// })

// sent from telebirr server
router.post('/result', (req, res) => {

    console.log(`result: ${req.body}`)
    res.send(req.body)
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
        str += arr[i] + "=" + jsonObj[arr[i]] + "&";
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