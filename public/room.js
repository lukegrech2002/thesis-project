const socket = io('/'); //server.js is at the root of the app
let myVideoStream;
let mediaRecorder;
let recordedBlobs;
var isScreenStreaming = false;
let isStreamRecording = false;
const videoGrid = document.getElementById('videoGrid');
const myVideo = document.createElement('video');
const participantList = document.getElementById('participants');
let recordStreamButton = document.getElementById("recordStreamButton");
let recordStreamTimePassedDiv = document.getElementById("spaceDivLeft");
let recordText = document.getElementById("recordText");
myVideo.muted = true; //Not listening to yourself
const peersArray = {};
let participantsArray = [];

const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3000',
});

//Connection popup
$(document).ready(function(){   
  setTimeout(function () {
    $("#connectionPopUp").fadeIn(300);
  }, 3000);
  setTimeout(function () {
    $("#connectionPopUp").fadeOut(300);
  }, 11000); 
}); 

let audioStartOnOff;
let videoStartOnOff;

$.ajax({
  url: '/:room/videoAudioSettings',
  method: 'POST',
  success: (data) => {
    audioStartOnOff = data.audioStart;
    videoStartOnOff = data.videoStart;
  }
});

function Area(Increment, Count, Width, Height, Margin = 10) {
  let i = w = 0;
  let h = Increment * 0.75 + (Margin * 2);
  while (i < (Count)) {
    if ((w + Increment) > Width) {
      w = 0;
      h = h + (Increment * 0.75) + (Margin * 2);
    }
    w = w + Increment + (Margin * 2);
    i++;
  }
  if (h > Height) return false;
  else return Increment;
}

function AppendVideoContainer() {
  let Margin = 2;
  let Width = videoGrid.offsetWidth - (Margin * 2);
  let Height = videoGrid.offsetHeight - (Margin * 2);
  let max = 0;

  let i = 1;
  while (i < 5000) {
    let w = Area(i, myVideo.length, Width, Height, Margin);
    if (w === false) {
      max = i - 1;
      break;
    }
    i++;
  }
  max = max - (Margin * 2);
  setWidth(max, Margin);
}

function setWidth(width, margin) {
  for (let setWidthVar = 0; setWidthVar < myVideo.length; setWidthVar++) {
    myVideo[setWidthVar].style.width = width + "px";
    // myVideo[setWidthVar].style.margin = margin + "px";
    myVideo[setWidthVar].style.height = (width * 0.75) + "px";
  }
}

window.addEventListener("load", function (event) {
  AppendVideoContainer();
  window.onresize = AppendVideoContainer;
}, false);
    
myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, USERNAME, FULL_NAME, PROFILE_PIC, IP_ADDRESS, id);
  socket.on('room-participants', ({participants}) => {
    outputParticipants(participants);
  });
  console.log('id' + id, ROOM_ID, USERNAME, FULL_NAME, PROFILE_PIC, IP_ADDRESS);
});

myPeer.on('error', function(err) {
  console.log(err);
});

navigator.mediaDevices.getUserMedia({ 
  video: true, 
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);
  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
      AppendVideoContainer();
    });
  });
  socket.on("user-connected", (data) => {
    let userId = data.userId;
    let username = data.username;
    setTimeout(function () { 
      connectToNewUser(userId, stream, username); 
    },4000);
  });
  let text = $("input");
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val()); //Reading chatbox input and emitting to server
      text.val(''); //Clearing chatbox
    }
  });
  socket.on("createMessage", (data) => {
    if(data.username == null){
      $("ul").append(`<li class="message">${data.message}</li>`);
    }else{
      let chatDiv = document.getElementById("messages");
    if(chatDiv.value === "") return;
      let li = document.createElement("li");
      //Giving a unique ID
      li.id="message-" + data.message;
      li.innerHTML = '<strong>' + data.username + ': </strong>' + data.message;
      //Delete button
      li.innerHTML += "<button data-message_id='" + data.message + "' onclick='deleteMessage(this);'><i class='fas fa-trash'></i></button>";
      chatDiv.appendChild(li);
    }
    scrollToBottom(); //Scrolling to bottom of chat
  });
  //Share screen
  shareScreen = () => {
    let displayMediaOptions = {cursor:true};
    navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
    .then(function(stream){
      myVideo.srcObject = stream;
    });
  }
}).catch(e => console.error(e));

outputParticipants = (participants) => {
  participantList.innerHTML = '';
  const h3 = document.createElement('h3');
  h3.innerText = "Participants";
  participantList.appendChild(h3);
  participants.forEach(participant => {
    const p = document.createElement('p');
    const li = document.createElement('li');
    const spanImg = document.createElement('span');
    p.innerText = participant.fullName;
    li.innerText = participant.username;
    spanImg.innerHTML = '<img class="participants-profile-pic" src="https://' + participant.ipAddress + ':3000/uploads/' + participant.profilePic + '"></img>';
    participantList.appendChild(spanImg);
    participantList.appendChild(p);
    participantList.appendChild(li);
  });
}

$.ajax({
  url: "/load-messages",
  method: "POST",
  success: function (messagesResponse){
    let chatDiv = document.getElementById("messages");
    if(chatDiv.value === "") return;

    let messageData = JSON.parse(messagesResponse);
    for(let messagesCount = 0; messagesCount < messageData.length; messagesCount++){
      let li = document.createElement("li");
      //Giving a unique ID
      li.id="message-" + messageData[messagesCount].message_id;
      li.innerHTML = '<strong>' + messageData[messagesCount].username + ': </strong>' + messageData[messagesCount].message;
      //Delete button
      li.innerHTML += "<button data-message_id='" + messageData[messagesCount].message_id + "' onclick='deleteMessage(this);'><i class='fas fa-trash'></i></button>";
      chatDiv.appendChild(li);
    }
  }
});

function deleteMessage(self){
  let message_id = self.getAttribute("data-message_id");
  socket.emit("delete-message", message_id);
}

socket.on("delete-message", function (message_id){
  let deletableMessage = document.getElementById("message-" + message_id);
  deletableMessage.innerHTML = "<i>This message has been removed<i>"; //Replacing deleted message with removed message text
});

socket.on('user-disconnected', userId => {
  if (peersArray[userId]) peersArray[userId].close();
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video'); //Creating video element when user joins call
  call.on('stream', (userVideoStream) => {
    setTimeout(function () { 
      addVideoStream(video, userVideoStream);
    }, 4000);
  });
  call.on('close', () => {
    video.remove();
  });
  peersArray[userId] = call;
}

function addVideoStream(video, stream) {
  if(audioStartOnOff === "Off"){
    audioMuteUnmute();
  }if(videoStartOnOff === "Off"){
    videoPlayStop();
  }
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

toggleParticipantsSidebar = () => {
  let participantsSidebar = document.getElementById("participantsSidebar");
  if(participantsSidebar.style.width == "13em"){
    closeParticipantsSidebar();
  }else{
    openParticipantsSidebar();
  }
}

openParticipantsSidebar = () => {
  let participantsSidebar = document.getElementById("participantsSidebar");
  participantsSidebar.style.width = "13em";
}

closeParticipantsSidebar = () => {
  let participantsSidebar = document.getElementById("participantsSidebar");
  participantsSidebar.style.width = "0";
}

//Scrolling to bottom of chat for latest messages
scrollToBottom = () => {
  let scrollVar = $('.messages');
  scrollVar.scrollTop(scrollVar.prop("scrollHeight"));
}

toggleChatPopUp = () => {
  let ChatPopUp = document.getElementById("chatPopUp");
  if(ChatPopUp.style.width == "20em"){
    closeChatPopUp();
  }else{
    openChatPopUp();
  }
}

openChatPopUp = () => {
  let ChatPopUp = document.getElementById("chatPopUp");
  ChatPopUp.style.width = "20em";
}

closeChatPopUp = () => {
  let ChatPopUp = document.getElementById("chatPopUp");
  ChatPopUp.style.width = "0";
}

//Function that will be called on Button click in HTML to mute/unmute audio
audioMuteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    changeToUnmuteButton();
  } else {
    changeToMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

//Function that will be called on Button click in HTML to play/stop video
videoPlayStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    changeToPlayVideoButton();
  } else {
    changeToStopVideoButton();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

//Functions to change the Button images on button click
changeToMuteButton = () => {
  const html = `
  <div class="mute-unmute-text-popup-div" id="muteUnmuteTextPopUpDiv"  onclick="audioMuteUnmute()">
    <i class="fas fa-microphone"></i>
    <span id="muteUnmuteText" class="mute-unmute-text">
      Mute
    </span>
  </div>
  `
  document.querySelector('.mute-unmute-btn-div').innerHTML = html;
}

changeToUnmuteButton = () => {
  const html = `
    <div class="mute-unmute-text-popup-div" id="muteUnmuteTextPopUpDiv"  onclick="audioMuteUnmute()">
    <i class="unmute fas fa-microphone-slash"></i>
    <span id="muteUnmuteText" class="mute-unmute-text">
      Unmute
    </span>
    </div>
  `
  document.querySelector('.mute-unmute-btn-div').innerHTML = html;
}

changeToStopVideoButton = () => {
  const html = `
  <div class="play-stop-text-popup-div" id="playStopTextPopUpDiv" onclick="videoPlayStop()">
    <i class="fas fa-video"></i>
    <span id="playStopText" class="play-stop-text">
      Stop Video
    </span>
  </div>
  `
  document.querySelector('.play-stop-btn-div').innerHTML = html;
}

changeToPlayVideoButton = () => {
  const html = `
  <div class="play-stop-text-popup-div" id="playStopTextPopUpDiv" onclick="videoPlayStop()">
    <i class="stop fas fa-video-slash"></i>
    <span id="playStopText" class="play-stop-text">
      Play Video
    </span>
  </div>
  `
  document.querySelector('.play-stop-btn-div').innerHTML = html;
}

let classInfoModal = document.getElementById("lectureInfoModal");
let classInfoButton = document.getElementById("lectureInfoTextPopUpDiv");
let classInfoSpan = document.getElementsByClassName("close")[0];

classInfoButton.onclick = function() {
  classInfoModal.style.display = "block";
}

classInfoSpan.onclick = function() {
  classInfoModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == classInfoModal) {
    classInfoModal.style.display = "none";
  }
}

function toggleScreenSharing() {
  const constraints = {
    video: true,
  };
  let screenMediaPromise;
  if (!isScreenStreaming) {
    if (navigator.getDisplayMedia) {
      screenMediaPromise = navigator.getDisplayMedia(constraints);
    }else if (navigator.mediaDevices.getDisplayMedia){
      screenMediaPromise = navigator.mediaDevices.getDisplayMedia(constraints);
    }else{
      screenMediaPromise = navigator.mediaDevices.getUserMedia({
        video: {
          mediaSource: "screen",
        },
      });
    }
  }else{
    const constraints = {
      audio: true,
      video: true,
    };
    screenMediaPromise = navigator.mediaDevices.getUserMedia(constraints);
    if (isStreamRecording) {
      stopStreamRecording();
    }
  }
  screenMediaPromise
    .then((screenStream) => {
      isScreenStreaming = !isScreenStreaming;
      refreshMyStreamToPeers(screenStream);
      refreshMyLocalStream(screenStream);
      myVideo.classList.toggle("mirror");
    })
    .catch((e) => {
      console.error("[Error] Unable to share the screen", e);
    });
}

function refreshMyStreamToPeers(stream) {
  if (thereIsPeerConnections()) {
    for (var userId in peersArray) {
      var sender = peersArray[userId]
        .getSenders()
        .find((s) => (s.track ? s.track.kind === "video" : false));
      sender.replaceTrack(stream.getVideoTracks()[0]);
    }
  }
}

function attachMediaStream(element, stream) {
  console.log("Success, media stream attached");
  element.srcObject = stream;
}

function refreshMyLocalStream(stream) {
  stream.getVideoTracks()[0].enabled = true;
  const newStream = new MediaStream([
    stream.getVideoTracks()[0],
    myVideoStream.getAudioTracks()[0],
  ]);
  myVideoStream = newStream;
  window.stream = newStream;
  attachMediaStream(myVideo, myVideoStream);
  stream.getVideoTracks()[0].onended = function () {
    if (isScreenStreaming) toggleScreenSharing();
  };
}

function thereIsPeerConnections() {
  if (Object.keys(peersArray).length === 0) {
    return false;
  }
  return true;
}

recordStreamButton.addEventListener('click', startStopStreamRecording);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function getDataTimeString() {
  const d = new Date();
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date}-${time}`;
}

function getTimeToString(time) {
  let diffInHrs = time / 3600000;
  let hh = Math.floor(diffInHrs);
  let diffInMin = (diffInHrs - hh) * 60;
  let mm = Math.floor(diffInMin);
  let diffInSec = (diffInMin - mm) * 60;
  let ss = Math.floor(diffInSec);
  let formattedHH = hh.toString().padStart(2, "0");
  let formattedMM = mm.toString().padStart(2, "0");
  let formattedSS = ss.toString().padStart(2, "0");
  return `${formattedHH}:${formattedMM}:${formattedSS}`;
}

function startRecordingTime() {
  recStartTime = Date.now();
  var rc = setInterval(function printTime() {
    if (isStreamRecording) {
      recElapsedTime = Date.now() - recStartTime;
      recordStreamTimePassedDiv.innerHTML = " 🔴 " + getTimeToString(recElapsedTime);
      return;
    }
    clearInterval(rc);
  }, 1000);
}

let streamIsRecording = false;

function startStopStreamRecording(){
  if(streamIsRecording == false){
    startStreamRecording();
    streamIsRecording = true;
  }else if(streamIsRecording == true){
    stopStreamRecording();
    streamIsRecording = false;
  }
}
function startStreamRecording() {
  recordedBlobs = [];
  recordText.innerHTML = "Stop Recording";
  let options = { mimeType: "video/webm;codecs=vp9,opus" };
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options = { mimeType: "video/webm;codecs=vp8,opus" };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: "video/webm" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "" };
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(myVideoStream, options);
  } catch (err) {
    console.error(err);
    return;
  }
  mediaRecorder.onstop = (event) => {
    downloadRecordedStream();
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
  isStreamRecording = true;
  recordStreamButton.style.setProperty("color", "red");
  startRecordingTime();
}

function stopStreamRecording() {
  mediaRecorder.stop();
  isStreamRecording = false;
  recordStreamButton.style.setProperty("color", "white");
  recordStreamTimePassedDiv.innerHTML = "";
  recordText.innerHTML = "Start Recording";
}

function downloadRecordedStream() {
  const recFileName = getDataTimeString() + "-REC.webm";
  const blob = new Blob(recordedBlobs, { type: "video/webm" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = recFileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

leaveCall = () => {
  window.location.href = '/';
}
