// const {io} = require('../index');
// const {authSocket} = require('../middleware/auth');
// io
//     .use(authSocket)
//     .on('connection', async(socket) => {

//         socket.emit('connected');

//         socket.join(socket.user._id);

//         var eventHandlers = {
//             notification: new NotificationSocket(io, socket)
//         }

//         for( var eh in eventHandlers){
//             var handler = eventHandlers[eh];
//             for(var event in handler){
//                 socket.on(event, handler[event]);
//             }
//         }
//     });