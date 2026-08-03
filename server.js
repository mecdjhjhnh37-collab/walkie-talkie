const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');

// ربط المجلد اللي جواته ملفاتك (عام) مع السيرفر مباشرة
app.use(express.static(path.join(process.cwd(), 'عام')));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'عام', 'index.html'));
});

io.on('connection', (socket) => {
    socket.on('incoming-call', (data) => {
        socket.broadcast.emit('incoming-call', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);
