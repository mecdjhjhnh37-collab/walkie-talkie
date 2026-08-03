const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const fs = require('fs');
const path = require('path');

app.use(express.static(path.join(process.cwd(), 'عام')));

app.get('/', (req, res) => {
    const indexPath = path.join(process.cwd(), 'عام', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('<h1>جاري تجهيز الواجهة، يرجى الانتظار ثواني...</h1>');
    }
});

io.on('connection', (socket) => {
    socket.on('incoming-call', (data) => {
        socket.broadcast.emit('incoming-call', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);
