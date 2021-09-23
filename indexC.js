var io = require('socket.io-client');
const winston = require('winston');
const {Notification} = require('./models/notification');
socket = io.connect('http://178.62.55.81',  {query: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGZiZWMzOGIzYTZjNTAwMTUzODQwZWYiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjMyMzMyNzU3fQ.1tBz4H1y52Oa5ga7dAFZoON2RNsdYtkJl2gIryUWCC0"},{
   // reconnection: true,
  //  reconnectionDelay: 10000
  });
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGViMzEyMWYwOGRjNjFmNzhlYzc4NjciLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjI3NjM//1ODA4fQ.miPyOAQ9To0JTpmQEW_LtjoRskm3lDtx0YJHGFZ4008
// Add a connect listener

/*http://178.62.55.81?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGZiZWMzOGIzYTZjNTAwMTUzODQwZWYiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjMyMzMyNzU3fQ.1tBz4H1y52Oa5ga7dAFZoON2RNsdYtkJl2gIryUWCC0*/
socket.on('connect', function (sockett) {
    winston.info('Connected from client!');
   
});
 socket.on('new notification', (msg) =>{
        const not = new Notification(msg);
        winston.info('notification: '+ not);
    });
	
	socket.on('all notification', (notifications) =>{
        notifications.forEach(not => {
			let nots = new Notification(not);
			 winston.info('notification: '+ nots);
		});
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