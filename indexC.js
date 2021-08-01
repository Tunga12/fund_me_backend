var io = require('socket.io-client');
const winston = require('winston');
const {Notification} = require('./models/notification');
socket = io.connect('http://localhost:3000',  {query: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTA0Mjg4ZmI3NWNmYzBkMGMxZTEyZmYiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjI3NjgwNDU1fQ.Na9uSUJKU-ag8zqpuxtmz47stt3kihbe_VqAmMz97-s"},{
   // reconnection: true,
  //  reconnectionDelay: 10000
  });
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGViMzEyMWYwOGRjNjFmNzhlYzc4NjciLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjI3NjM//1ODA4fQ.miPyOAQ9To0JTpmQEW_LtjoRskm3lDtx0YJHGFZ4008
// Add a connect listener
socket.on('connect', function (sockett) {
    winston.info('Connected from client!');
   
});
 socket.on('new notification', (msg) =>{
        const not = new Notification(msg);
        winston.info('notification: '+ not);
    });
    socket.on('unread notification count', (msg) =>{
        winston.info('unread count '+msg);
    });
    socket.on('viewed notification', (msg) =>{
        const not = new Notification(msg);
        winston.info('viewed notification: '+not);
    });
    socket.on('error', (msg) =>{
        winston.info('error: '+msg);
    });