// الاتصال المباشر بالسيرفر
const socket = io();

const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const talkBtn = document.getElementById('talkBtn');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// 1️⃣ إرسال الرسائل النصية
function sendMessage() {
  const text = messageInput.value.trim();
  if (text !== "") {
    socket.emit('send-message', text);
    messageInput.value = '';
  }
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (messageInput) {
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

// 2️⃣ استقبال النصوص وإظهارها في شاشة المحادثة
socket.on('receive-message', (text) => {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// 3️⃣ التسجيل والإرسال الصوتي (نقرة للتسجيل ونقرة لإيقاف والتسليم)
async function toggleRecording(e) {
  if (e) e.preventDefault();

  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            socket.emit('send-audio', reader.result);
          };
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      isRecording = true;

      talkBtn.classList.add('recording');
      const span = talkBtn.querySelector('span');
      if (span) span.textContent = "جاري التسجيل... (اضغط للإيقاف)";

    } catch (err) {
      alert("يرجى السماح بالوصول للميكروفون لتسجيل الصوت!");
    }
  } else {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording = false;

    talkBtn.classList.remove('recording');
    const span = talkBtn.querySelector('span');
    if (span) span.textContent = "اضغط للتحدث";
  }
}

if (talkBtn) talkBtn.addEventListener('click', toggleRecording);

// 4️⃣ استقبال الأصوات وإظهارها في الشاشة
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
