var io = require('socket.io-client');
const winston = require('winston');

socket = io.connect('http://localhost:3000',  {query: "id=60eb3139f08dc61f78ec786a"},{
    reconnection: true,
    reconnectionDelay: 10000
  });

// Add a connect listener
socket.on('connect', function (sockett) {
    winston.info('Connected from client!');
    socket.on('notification', (msg) =>{
        winston.info(msg);
    });
});
