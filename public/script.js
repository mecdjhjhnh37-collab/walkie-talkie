const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const talkBtn = document.getElementById('talkBtn');

let mediaRecorder;
let audioChunks = [];

// 1️⃣ إرسال النص
function sendMessage() {
  const text = messageInput.value.trim();
  if (text !== "") {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    
    messageInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (messageInput) {
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// 2️⃣ إعدادات تسجيل الصوت REAL AUDIO
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // إنشاء مشغل صوت داخل شاشة المحادثة
      const msgDiv = document.createElement('div');
      msgDiv.className = 'message user';
      const audio = document.createElement('audio');
      audio.src = audioUrl;
      audio.controls = true;
      audio.style.maxWidth = '200px';
      
      msgDiv.appendChild(audio);
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;

      // إيقاف استخدام الميكروفون
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    talkBtn.classList.add('recording');
    const span = talkBtn.querySelector('span');
    if (span) span.textContent = "جاري التسجيل...";

  } catch (err) {
    alert("يرجى السماح بصلاحية الميكروفون لتشغيل اللاسلكي!");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    talkBtn.classList.remove('recording');
    const span = talkBtn.querySelector('span');
    if (span) span.textContent = "اضغط للتحدث";
  }
}

// أحداث الضغط على زر التحدث
if (talkBtn) {
  talkBtn.addEventListener('mousedown', startRecording);
  talkBtn.addEventListener('mouseup', stopRecording);
  
  talkBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startRecording();
  });
  talkBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopRecording();
  });
}
