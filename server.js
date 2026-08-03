const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// إعداد Socket.io وحجم الصوت
const io = new Server(server, {
  maxHttpBufferSize: 1e7 // 10MB
});

// تقديم ملفات الواجهة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// بث النصوص والأصوات بين كل الأجهزة المتصلة مباشرة
io.on('connection', (socket) => {
  console.log('جهاز جديد اتصل باللاسلكي');

  socket.on('send-message', (data) => {
    io.emit('receive-message', data);
  });

  socket.on('send-audio', (audioData) => {
    io.emit('receive-audio', audioData);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
