const winston = require("winston");
const nodeCron = require("node-cron");
const express = require("express");
const crypto = require("crypto");
const NodeRSA = require("node-rsa");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
let server = http.createServer(app);
const io = require("socket.io")(server);
const path = require("path");

/*
{
  origins: [
    "*:*",
    "http://highlight-group.com",
    "http://localhost:4200",
    "http://178.62.55.81",
  ],

  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "https://example.com",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "my-custom-header",
      "Access-Control-Allow-Credentials": true,
    });
    res.end();
  },
}
*/

module.exports.io = io;
//module.exports.server = server
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
//const {scheduler} = require('./startup/scheduler');
// 55 23
//const job = nodeCron.schedule("0 55 20 * * *",scheduler);
require("./startup/prod")(app);
require("./startup/connection").conn();
// const {conn} = require('./startup/notification');
// conn();
/* const key= new NodeRSA(
	'-----BEGIN PUBLIC KEY-----\n'+
	'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwrmVHBX/5tMupOt\n'+
	'OlInGEzmHspLSL+O5k5vFrdG3QVo7mZIH5U70hv50K/NVPP6HHBRkZkRkJkf9Zl\n'+
	'xSbsU2/NnRpLEaa2V4xMqpJTANEg1BgIblGXDr6LaFLUI5/BSl1DYhEB5UQht1vYi\n'+
	'sokU2QPFV+9t8doSVe3woLnUKvx+QS9bAvvlEn1p9x7tMNSyb8afPWoN7LLBb\n'+
	'ey5PJdLV+GLELTi6vQl3h5vV97kmIJqAQYjKT/VagjbKos6hHjZIoNLt48Ohzt2dBq\n'+
	'NFcqBRp86HWKu8mz+Mk5x+SRRdiIOlyrYnKq79FqFlbwzmLEiKKciXshyecPFGZ\n'+
	'V/TRpOD3QIDAQAB\n'+
	'-----END PUBLIC KEY-----','public');
						
						//console.log(key);
						console.log(key.encrypt('hfggdgdgfgs','base64')); */

//console.log(crypto.createHash('sha256').update('when are you').digest('base64'));
const port = 5000;
const serv = server.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports.server = serv;
