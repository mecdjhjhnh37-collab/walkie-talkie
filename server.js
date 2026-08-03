const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 1e8 // للسماح برفع الصور والفيديوهات الكبيرة حتى 100MB مجاناً
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
    { id: 'general', name: '🌐 المحادثة العامة', password: '' }
];

// ذاكرة لحفظ الرسائل (مثل واتساب - لا تنحذف إلا إذا حذفها صاحبها)
let messagesStore = {
    'general': []
};

io.on('connection', (socket) => {
    socket.emit('init-rooms', globalRooms);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        if (!messagesStore[roomId]) messagesStore[roomId] = [];
        // إرسال الرسائل القديمة للمستخدم فور دخوله
        socket.emit('load-old-messages', messagesStore[roomId]);
    });

    socket.on('create-room', (newRoom) => {
        globalRooms.push(newRoom);
        messagesStore[newRoom.id] = [];
        io.emit('room-created', newRoom);
    });

    // استلام الرسائل والصور والفيديوهات وحفظها
    socket.on('send-chat-message', (data) => {
        const msgObject = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            roomId: data.roomId,
            sender: data.sender,
            text: data.text || '',
            file: data.file || null,
            fileType: data.fileType || null
        };

        if (!messagesStore[data.roomId]) messagesStore[data.roomId] = [];
        messagesStore[data.roomId].push(msgObject);

        io.to(data.roomId).emit('receive-chat-message', msgObject);
    });

    // حذف الرسالة (للمرسل فقط)
    socket.on('delete-message', (data) => {
        if (messagesStore[data.roomId]) {
            messagesStore[data.roomId] = messagesStore[data.roomId].filter(m => m.id !== data.msgId);
            io.to(data.roomId).emit('message-deleted', data.msgId);
        }
    });

    // أحداث المكالمات الصوتية والمرئية
    socket.on('call-user', (data) => {
        socket.to(data.roomId).emit('incoming-call', {
            signal: data.signalData,
            from: data.from,
            type: data.type
        });
    });

    socket.on('answer-call', (data) => {
        socket.to(data.roomId).emit('call-accepted', data.signal);
    });

    socket.on('end-call', (data) => {
        socket.to(data.roomId).emit('call-ended');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
