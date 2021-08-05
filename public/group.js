const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
let username;
let room;

$.ajax({
  url: "/group/details",
  method: "POST",
  success: (groupUserDetails) => {
    let groupDetailsObj = JSON.parse(groupUserDetails)
    username = groupDetailsObj.groupsLoggedInUsername;
    room = groupDetailsObj.loggedInGroup;
  },
  async: false //AJAX Query must finish executing before continuing
});

const socket = io();

//Joining group
socket.emit('private_chat_joinRoom', {username, room});

//Getting group and users
socket.on('private_chat_roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
});

// Receiving message from server
socket.on('private_chat_message', message => {
  console.log(message);
  outputMessage(message);
  //Scrolling to bottom of chat for latest messages
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Submitting message on button click
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) return false;
  //Emitting message to server
  socket.emit('private_chat_chatMessage', msg);
  //Clearing input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

outputMessage = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span> ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

//Displaying room name
outputRoomName = (room) => {
  roomName.innerText = room;
}

//Displaying users in the group
outputUsers = (users) => {
  userList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}