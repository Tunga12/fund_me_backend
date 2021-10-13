const { createNotification, numOfUnreadNotification, markAsViewed, allNotification } = require('../models/notification');
const validate= require('../models/notification').validate;
const mongoose = require('mongoose');

// const io;
var socket;
var NotificationSocket = function (io, socket) {
    this.io = io;
    socket = socket;

    // Expose handler methods for events
    this.handler = {
        notification: notification.bind(this), // use the bind function to access this.io   // and this.socket in events
        viewed: viewed.bind(this),
        'get unread count': getUnreadCount.bind(this),
    };
}

async function notification(io,notification) {
    // const {error} = validate(notification);
    // if (error) return console.log(error.details[0].message);

    // create a notification
    const newNotification = await createNotification(notification);

    newNotification.recipients.forEach(async recipientId => {
        io.to(recipientId.toString()).emit('new notification', newNotification);

        // send number of unread notification to user
        const count = await numOfUnreadNotification(recipientId.toString());
		const notifications = await allNotification(recipientId.toString());
		
        io.to(recipientId.toString()).emit('unread notification count', count);
		io.to(recipientId.toString()).emit('all notification', notifications);
    });

};

async function viewed(io, userId,notificationId) {

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return  io.to(userId).emit('error','A notification with this id is not found.');
    }

    const notification = await markAsViewed(notificationId, userId);

	if(!notification) return  io.to(userId).emit('error','A notification with this id is not found.');
	
    io.to(userId).emit('viewed notification', notification);

    const count = await numOfUnreadNotification(userId);
    const notifications = await allNotification(userId);
	
    io.to(userId).emit('unread notification count', count);
	io.to(userId).emit('all notification', notifications);
	return notification;
}

async function getUnreadCount(io, socket) {
    
    const count = await numOfUnreadNotification(socket.user._id);
	const notifications = await allNotification(socket.user._id);
	
    io.to(socket.user._id).emit('unread notification count', count);
	io.to(socket.user._id).emit('all notification', notifications);
}



module.exports = {
    NotificationSocket: NotificationSocket,
    notification: notification,
    viewed: viewed,
    getUnreadCount : getUnreadCount
}