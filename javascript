const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, 'public')));

// إدارة الغرف والاتصالات
io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const numClients = room ? room.size : 0;

        // السماح لشخصين فقط في الغرفة الخاصة
        if (numClients >= 2) {
            socket.emit('room-full');
            return;
        }

        socket.join(roomId);
        socket.roomId = roomId;

        if (numClients === 1) {
            // إعلام المستخدم الأول بوجود طرف ثانٍ
            socket.to(roomId).emit('user-joined');
        }

        socket.on('signal', (data) => {
            socket.to(roomId).emit('signal', data);
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-left');
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
