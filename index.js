const winston = require('winston');
const express = require('express');
const app = express();
const cors = require('cors');
const {Server} = require('socket.io');
const http = require('http');
let server = http.createServer(app);
const io = require('socket.io')(server);

module.exports.io = io;
//module.exports.server = server
app.use(cors({origin: '*', preflightContinue: true}));
app.use('/uploads',express.static('uploads'));
require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);
require('./startup/connection').conn();
// const {conn} = require('./startup/notification');
// conn();

const port = process.env.PORT || 3000;
const serv = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports.server = serv;
