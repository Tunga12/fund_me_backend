var io = require('socket.io-client');
const winston = require('winston');
const {Notification} = require('./models/notification');
socket = io.connect('http://localhost:3000',  {query: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTFhN2IwOTliODhjZDFmNjQ5YmMwYWEiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE2MzA4NDkyNTV9.nFdvjyWVrCvUvVPNSoa9qnxNIlSfA--fIuSNpTsxS1w"},{
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