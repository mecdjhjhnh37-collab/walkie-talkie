const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// قراءة الملفات من مجلد public الذي يضم index.html
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let globalRooms = [
    { id: 'general', name: '🌐 المحادثة العامة', password: '' }
];

io.on('connection', (socket) => {
    socket.emit('init-rooms', globalRooms);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('create-room', (newRoom) => {
        globalRooms.push(newRoom);
        io.emit('room-created', newRoom);
    });

    socket.on('send-chat-message', (data) => {
        io.to(data.roomId).emit('receive-chat-message', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
