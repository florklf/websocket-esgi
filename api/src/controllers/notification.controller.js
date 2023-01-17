const { EventEmitter } = require('events');

const notificationEventEmitter = new EventEmitter();
let excludedClient = null;

exports.postNotification = async (req, res) => {
    const { userId , message } = req.body;
    excludedClient = userId;
    notificationEventEmitter.emit('notification', message);
    res.status(200).end();
};

exports.getNotification = (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // nginx: disable buffering
    });

    const client = +req.query.userId;

    notificationEventEmitter.on('notification', (message) => {
        if (client !== excludedClient) {
            res.write(`event: notification\ndata: ${message}\n\n`)
        } else {
            res.status(200).end();
        }
    });
    excludedClient = null;
    return;
};