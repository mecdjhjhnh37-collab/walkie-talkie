const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('call-user', (data) => {
        if (data.roomId === 'general') return;
        socket.to(data.roomId).emit('incoming-call', {
            signal: data.signal,
            from: data.from,
            type: data.type,
            roomId: data.roomId
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
server.listen(PORT);
