const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// توجيه السيرفر ليقرأ الملفات من مجلد "عام"
app.use(express.static(path.join(__dirname, 'عام')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'عام', 'index.html'));
});

// التعامل مع اتصالات Socket.io للرسائل والصوت
io.on('connection', (socket) => {
    socket.on('chat-message', (data) => {
        socket.broadcast.emit('chat-message', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
