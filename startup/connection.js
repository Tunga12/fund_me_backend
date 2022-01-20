const winston = require("winston");
const { io } = require("../index");
const { authSocket } = require("../middleware/auth");
const {
  NotificationSocket,
  notification,
  viewed,
  getUnreadCount,
} = require("../realtime/notificationSocket");

var sock;

function conn() {
  io.use(authSocket).on("connection", async (socket) => {
    sock = socket;

    // socket.emit('connected');
    winston.info("Connected from server!");
    socket.emit("Connected", socket.user._id);
    socket.join(socket.user._id);

    // var eventHandlers = {
    //     notification: new NotificationSocket(io, socket)
    // }

    // for( var eh in eventHandlers){
    //    // console.log(eh);
    //    // console.log(eventHandlers[eh]);
    //     var handler = eventHandlers[eh].handler;
    //     for(var event in handler){
    //         //console.log(handler[event]);
    //         socket.on(event, handler[event]);
    //     }
    // }

    async function getUnread() {
      await getUnreadCount(io, socket);
    }
    getUnread().then();
  });
}

async function newNotification(not) {
  await notification(io, not);
}

async function viewedNotification(userId, notificationId) {
  const noti = await viewed(io, userId, notificationId);
  sockets = [];
  return noti;
}

module.exports = {
  conn: conn,
  newNotification: newNotification,
  viewedNotification: viewedNotification,
};
