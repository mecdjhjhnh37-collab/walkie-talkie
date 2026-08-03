const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');

// قراءة الملفات الثابتة من مجلد عام
app.use(express.static(path.join(__dirname, 'عام')));

// إرسال صفحة الواجهة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'عام', 'index.html'));
});

io.on('connection', (socket) => {
    socket.on('incoming-call', (data) => {
        socket.broadcast.emit('incoming-call', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server is running');
});
