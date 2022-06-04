const winston = require("winston");
const nodeCron = require("node-cron");
const express = require("express");
const crypto = require("crypto");
const NodeRSA = require("node-rsa");
const fs = require("fs");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("https");
let server = http.createServer(
  {
    key: fs.readFileSync("/etc/letsencrypt/live/legasfund.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/legasfund.com/fullchain.pem"),
    requestCert: false,
    rejectUnauthorized: false,
  },
  app
);
const io = require("socket.io")(server, {
  cors: {
    origin: ["legasfund.com", "localhost:4200"],
    credentials: true,
  },
});
const path = require("path");

/*
{
  origins: [
    "*:*",
    "https://legasfund.com",
    "http://localhost:4200",
    "https://legasfund.com",
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
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders:
      "Origin, Content-Type, Accept, Authorization, X-Request-With, x-auth-token",
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
const { scheduler } = require("./startup/scheduler");
// 55 23
const job = nodeCron.schedule("0 55 20 * * *", scheduler);

const { backupMongoDB } = require("./startup/scheduler");

// Scheduling the backup every day at 3am (9 lelit in ethiopia time)
const task = nodeCron.schedule("0 3 * * *", backupMongoDB);

// task.start();

require("./startup/prod")(app);
require("./startup/connection").conn();
// const {conn} = require('./startup/notification');
// conn();

const port = 5000;
const serv = server.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports.server = serv;
