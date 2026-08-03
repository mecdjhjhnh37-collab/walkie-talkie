const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = "456439585406-9db1t4v6ivjkipdhmgoun7p7q3tfllku.apps.googleusercontent.com";
const googleClient = new OAuth2Client(CLIENT_ID);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 2e8
});

app.use(express.json());
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

// الدالة الآمنة للتحقق من إيميل الأدمن الحصري
async function verifyAdmin(token) {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        // التحقق الحصري من بريدك الإلكتروني
        return payload.email === "Mecdjhjhnh37@gmail.com";
    } catch (error) {
        return false;
    }
}

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

    // إغلاق الغرفة مع التحقق الأمني من صلاحية الأدمن
    socket.on('delete-room', async (data) => {
        const { roomId, token } = data;
        const authorized = await verifyAdmin(token);
        if (!authorized || roomId === 'general') return;

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

    // حذف الرسائل مع التحقق من الأدمن أو صاحب الرسالة نفسه
    socket.on('delete-message', async (data) => {
        const { roomId, msgId, token, isSender } = data;
        let canDelete = isSender;

        if (!canDelete && token) {
            canDelete = await verifyAdmin(token);
        }

        if (canDelete && messagesStore[roomId]) {
            messagesStore[roomId] = messagesStore[roomId].filter(m => m.id !== msgId);
            io.to(roomId).emit('message-deleted', msgId);
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
