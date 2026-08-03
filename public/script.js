const socket = io();

// استقبال النصوص من أي جهاز وإظهارها في الشاشة
socket.on('receive-message', (text) => {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// استقبال الصوت من أي جهاز وإظهاره في الشاشة
socket.on('receive-audio', (audioUrl) => {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  
  const audio = document.createElement('audio');
  audio.src = audioUrl;
  audio.controls = true;
  
  msgDiv.appendChild(audio);
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
