const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 2e8
});

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'عام')));

app.get('*', (req, res) => {
    const publicPath = path.join(__dirname, 'public', 'index.html');
    const rootPath = path.join(__dirname, 'index.html');
    const aamPath = path.join(__dirname, 'عام', 'index.html');

    if (fs.existsSync(publicPath)) res.sendFile(publicPath);
    else if (fs.existsSync(rootPath)) res.sendFile(rootPath);
    else if (fs.existsSync(aamPath)) res.sendFile(aamPath);
    else res.send("جاري تحميل السيرفر...");
});

let globalRooms = [
    { id: 'general', name: '🌐 المحادثة العامة (كتابة فقط)', password: '' }
];

let messagesStore = {
    'general': []
};

io.on('connection', (socket) => {
    socket.emit('init-rooms', globalRooms);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        if (!messagesStore[roomId]) messagesStore[roomId] = [];
        socket.emit('load-old-messages', messagesStore[roomId]);
    });

    socket.on('create-room', (newRoom) => {
        globalRooms.push(newRoom);
        messagesStore[newRoom.id] = [];
        io.emit('room-created', newRoom);
    });

    socket.on('delete-room', (roomId) => {
        if (roomId === 'general') return;
        globalRooms = globalRooms.filter(r => r.id !== roomId);
        delete messagesStore[roomId];
        io.emit('room-deleted', roomId);
    });

    socket.on('send-chat-message', (data) => {
        let fileData = data.file;
        let fileTypeData = data.fileType;
        if (data.roomId === 'general') {
            fileData = null;
            fileTypeData = null;
        }

        const msgObject = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            roomId: data.roomId,
            sender: data.sender,
            text: data.text || '',
            file: fileData,
            fileType: fileTypeData
        };

        if (!messagesStore[data.roomId]) messagesStore[data.roomId] = [];
        messagesStore[data.roomId].push(msgObject);

        io.to(data.roomId).emit('receive-chat-message', msgObject);
    });

    socket.on('delete-message', (data) => {
        if (messagesStore[data.roomId]) {
            messagesStore[data.roomId] = messagesStore[data.roomId].filter(m => m.id !== data.msgId);
            io.to(data.roomId).emit('message-deleted', data.msgId);
        }
    });

    socket.on('call-user', (data) => {
        if (data.roomId === 'general') return;
        socket.to(data.roomId).emit('incoming-call', {
            signal: data.signal,
            from: data.from,
            type: data.type
        });
    });

    socket.on('accept-call', (data) => {
        socket.to(data.roomId).emit('call-accepted', data.signal);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data.candidate);
    });

    socket.on('end-call', (data) => {
        socket.to(data.roomId).emit('call-ended');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
