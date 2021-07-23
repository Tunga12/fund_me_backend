const {Notification,validate} = require('../models/notification');
const winston = require('winston');
var users=[];
const {io} = require('../index');

module.exports.conn = function(){
    io.on('connection', (socket) => {
        winston.info('Connected on server!');
        users.push({
            userId: socket.handshake.query['id'],
            socketId: socket.id
        });

        console.log(users);
        socket.on('disconnect', ()=> {
            users.forEach((user)=>{
               if(user.socketId === socket.id){
                   const i = users.indexOf(user);
                   users.splice(i,1);
                   console.log(users);

               }
            })
        });
    });
}

module.exports.sendNotification = async function(notification){
    notification.userIds.forEach((userId) => {
        users.forEach((user) => {
            if(user.userId === userId.toString()){
                io.to(user.socketId).emit('notification',
                {
                    type: notification.type,
                    content: notification.content
                });
            }
        });
    });

}