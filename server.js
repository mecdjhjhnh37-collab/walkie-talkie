const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// إعداد Socket.io مع السماح بحجم الملفات الصوتيّة
const io = new Server(server, {
  maxHttpBufferSize: 1e7
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// الربط الحقيقي بين الأجهزة
io.on('connection', (socket) => {
  console.log('جهاز جديد اتصل باللاسلكي!');

  // عند استقبال نص من أي جهاز -> إرساله لجميع الأجهزة المتصلة فوراً
  socket.on('send-message', (data) => {
    io.emit('receive-message', data);
  });

  // عند استقبال صوت من أي جهاز -> إرساله لجميع الأجهزة المتصلة فوراً
  socket.on('send-audio', (audioData) => {
    io.emit('receive-audio', audioData);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
