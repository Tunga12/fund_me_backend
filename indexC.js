var io = require('socket.io-client');
const winston = require('winston');
const {Notification} = require('./models/notification');
socket = io.connect('http://localhost:3000',  {query: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGViMzEzOWYwOGRjNjFmNzhlYzc4NmEiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE2MjY5NjEwNDd9.EUWWbAZNuXeIaFVtn7SWcm6J8cJax4fuNEEZ2-Gi8hY"},{
    reconnection: true,
    reconnectionDelay: 10000
  });

// Add a connect listener
socket.on('connect', function (sockett) {
    winston.info('Connected from client!');
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
});
