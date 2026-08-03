const socket = io();

let username = "";
let currentRoom = "المحادثة العامة";

const loginScreen = document.getElementById("login-screen");
const roomsScreen = document.getElementById("rooms-screen");
const chatScreen = document.getElementById("chat-screen");

const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

const roomsList = document.getElementById("roomsList");
const createRoomBtn = document.getElementById("createRoom");

const roomTitle = document.getElementById("roomTitle");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const backBtn = document.getElementById("backBtn");

loginBtn.onclick = () => {
  if (usernameInput.value.trim() === "") return;

  username = usernameInput.value.trim();

  loginScreen.style.display = "none";
  roomsScreen.style.display = "block";
};

createRoomBtn.onclick = () => {
  const room = prompt("اسم الغرفة");

  if (!room) return;

  const li = document.createElement("li");
  li.className = "room";
  li.innerText = room;

  li.onclick = () => openRoom(room);

  roomsList.appendChild(li);
};

document.querySelector(".room").onclick = () => {
  openRoom("المحادثة العامة");
};

function openRoom(room) {
  currentRoom = room;

  roomTitle.innerText = room;

  roomsScreen.style.display = "none";
  chatScreen.style.display = "block";

  messages.innerHTML = "";

  socket.emit("join-room", {
    room,
    username
  });
}

sendBtn.onclick = sendMessage;

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  if (messageInput.value.trim() === "") return;

  socket.emit("chat-message", messageInput.value);

  messageInput.value = "";
}

socket.on("chat-message", (data) => {
  const div = document.createElement("div");

  div.className = "message";

  div.innerHTML =
    "<b>" +
    data.username +
    "</b><br>" +
    data.message +
    "<br><small>" +
    data.time +
    "</small>";

  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;
});

backBtn.onclick = () => {
  chatScreen.style.display = "none";
  roomsScreen.style.display = "block";
};
