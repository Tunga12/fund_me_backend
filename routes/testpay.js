const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const crypto = require('crypto');
const NodeRSA = require('node-rsa')
const winston = require('winston');
const router = express();

const axios = require('axios');

const stringA = 'appId=4347b88db6e64e0baa9e588acd42d50c&appKey=ffbf324b21974d778cec063f17aa1367&nonce=8a743de3ae3346e9920ecc46200226dd&notifyUrl=http://www.google.com&outTradeNo=426af391569b4e39b449d24b30bef93a&receiveName=OrgName&returnUrl=http://www.google.com&shortCode=410028&subject=Goods Name&timeoutExpress=30&timestamp=1624546517701&totalAmount=10';

const sign = crypto.createHash('sha256')
			.update(stringA.toUpperCase())
			.digest('base64');
			
const key= new NodeRSA(
	'-----BEGIN PUBLIC KEY-----\n'+
	'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOt\n'+
	'OlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9Zl\n'+
	'xSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYi\n'+
	'sokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBb\n'+
	'ey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBq\n'+
	'NFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZ\n'+
	'V/TRpOD3QIDAQAB\n'+
	'-----END PUBLIC KEY-----','public');
						
						
						
const ussd = key.encrypt('{"appId":"4347b88db6e64e0baa9e588acd42d50c","nonce":"8a743de3ae3346e9920ecc46200226dd","notifyUrl":"http://www.google.com","outTradeNo":"426af391569b4e39b449d24b30bef93b","receiveName":"Org Name","returnUrl":"http://www.google.com","shortCode":"410028","subject":"Goods Name","timeoutExpress":"30","timestamp":"1624546517701","totalAmount":"10"}','base64');

const data = {
    appid: '4347b88db6e64e0baa9e588acd42d50c',
    sign: sign,
	ussd:ussd
};


const config = {
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
};

// Post a help
router.post('/',async(req,res) => {
    
    axios.post('http://196.188.120.3:11443/ammapi/service-openup/toTradeWebPay', qs.stringify(data), config)
    .then((res) => {
		winston.info(`Status: ${res.status}`);
        winston.info('Body: ', res.data);
 
    }).catch((err) => {
        winston.info('Telebirr error: ', err);
    });
});