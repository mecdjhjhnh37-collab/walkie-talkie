const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// خدمة جميع الملفات
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'عام')));

app.get('/', (req, res) => {
    const mainPath = path.join(__dirname, 'index.html');
    const folderPath = path.join(__dirname, 'عام', 'index.html');

    // يفحص المكانين تلقائياً ويفتح الملف فوراً
    if (fs.existsSync(mainPath)) {
        res.sendFile(mainPath);
    } else if (fs.existsSync(folderPath)) {
        res.sendFile(folderPath);
    } else {
        res.status(404).send('الملف غير موجود');
    }
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
