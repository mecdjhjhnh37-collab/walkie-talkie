const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('مستخدم جديد اتصل:', socket.id);

    // استقبال الرسائل النصية وإعادتها للجميع
    socket.on('chat-message', (data) => {
        io.emit('chat-message', data);
    });

    // استقبال الصوت وإعادته للجميع
    socket.on('audio-stream', (data) => {
        socket.broadcast.emit('audio-stream', data);
    });

    socket.on('disconnect', () => {
        console.log('مستخدم غادر:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`السيرفر يعمل على المنفذ ${PORT}`);
});
