const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const https = require('https');
const fs = require('fs');
const path = require('path');
const server = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app);
const io = require('socket.io')(server);
const con = require('./config/connection');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { redirectLogin } = require('./config/auth');
const bodyParser = require('body-parser');
const ip = require("ip");
const favicon = require('serve-favicon');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const LIFETIME_HRS = 1000 * 60 * 60 * 6; //6 Hours session lifetime
require('dotenv').config();
let DB_HOST = process.env.DB_HOST;
let DB_USER = process.env.DB_USER;
let DB_PASSWORD = process.env.DB_PASSWORD;
let DB_DBNAME = process.env.DB_DBNAME;
// const {performance} = require('perf_hooks');

let connections = [];

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/peerjs', peerServer);
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.ico')));
// app.use(cors());

// peerServer.on('connection', function(id){
//   console.log('id' + id)
// })

//Body parser for POST
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const {
  port = 3000,
  SESSION_NAME = 'sid',
  SESSION_SECRET = 'session secret',
  SESSION_LIFETIME = LIFETIME_HRS
} = process.env

const options = {
	host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DBNAME
};

const sessionStore = new MySQLStore(options);

app.use(session({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  username: 0,
  cookie: { 
    secure: false,
    maxAge: SESSION_LIFETIME,
    sameSite: true
  }
}));

const homePage = require('./routes/index');
const loginPage = require('./routes/login');
const registerPage = require('./routes/register');
const registerSchool = require('./routes/registerSchool');
const joinLecturePage = require('./routes/joinLecture');
const createLecturePage = require('./routes/createLecture');
const accountManagementPage = require('./routes/accountManagement');
const studentsManagementPage = require('./routes/studentsManagement');
const teacherDetailsPage = require('./routes/teacherDetails');
const symptomFormPage = require('./routes/symptomForm');
const covidInfoPage = require('./routes/covid-19InfoCenter');
const roomLogin = require('./routes/roomLogin');
const createGroup = require('./routes/createGroup');
const joinGroup = require('./routes/joinGroup');
const group = require('./routes/group');
const symptomHistory = require('./routes/symptomHistory');
const helpAndSupport = require('./routes/helpAndSupport');
const termsAndConditions = require('./routes/termsAndConditions');

app.use('/', homePage);
app.use('/login', loginPage);
app.use('/register', registerPage);
app.use('/school-registration', registerSchool);
app.use('/join-lecture', joinLecturePage);
app.use('/create-lecture', createLecturePage);
app.use('/account-management', accountManagementPage);
app.use('/students-management', studentsManagementPage);
app.use('/teacher-details', teacherDetailsPage);
app.use('/symptom-form', symptomFormPage);
app.use('/covid-info-center', covidInfoPage);
app.use('/:room/login', roomLogin);
app.use('/create-group', createGroup);
app.use('/join-group', joinGroup);
app.use('/group', group);
app.use('/symptom-history', symptomHistory);
app.use('/help-and-support', helpAndSupport);
app.use('/terms-and-conditions', termsAndConditions);

app.get('*', redirectLogin);

let username;
let fullName;
let profilePic;
let roomId;
let ipAddress;

const {
  addParticipant,
  getCurrentParticipant,
  participantLeave,
  getRoomParticipants
} = require('./utils/roomParticipants');

const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const { json } = require('body-parser');

app.get('/:room/login', (req, res) => {
  let loginRoomID = req.params.room;
  let lectureDetails;

  con.query('SELECT * FROM lecture WHERE room_uuid = ?', [loginRoomID], 
  (err, result) => {
    lectureDetails = Object.assign({}, ...result);
    if(req.session.loggedInRoom === loginRoomID){
      res.redirect('/' + loginRoomID);
    }else{
      res.render('roomLogin', {
        loginRoomID, 
        lectureDetails
      });
    }
  });
});

app.post('/:room/login', (req, res) => {
  let roomLoginUUID = req.body.roomLoginURL;
  let roomLoginPassword = req.body.roomLoginPassword;
  let roomLoginAudio = req.body.roomLoginAudio;
  let roomLoginVideo = req.body.roomLoginVideo;

  con.query('SELECT * FROM lecture WHERE room_uuid = ? AND room_password = ?', [roomLoginUUID, roomLoginPassword], 
  (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      req.session.loggedInRoom = roomLoginUUID;
      res.send({
        video: roomLoginVideo,
        audio: roomLoginAudio,
        redirect: '/' + roomLoginUUID
      });
    }     
    res.end();
  });
});

app.get('/:room', (req, res) => {
  // console.log('Test Started');
  // const testStartTime = performance.now();
  username = req.session.user.username;
  fullName = req.session.user.first_name + " " + req.session.user.last_name;
  profilePic = req.session.user.profile_picture; 
  roomId = req.params.room;
  ipAddress = (ip.address());

  con.query('SELECT * FROM lecture WHERE room_uuid = ?', [roomId], 
  (err, result) => {
    onlineLectureDetails = Object.assign({}, ...result);
    if(req.session.loggedInRoom === roomId){
      res.render('room', { 
        data: {
          roomId: roomId, 
          username: username, 
          fullName: fullName,
          profilePic: profilePic,
          ipAddress: ipAddress,
          onlineLectureDetails: onlineLectureDetails
        }
      });
      // const testEndTime = performance.now();
      // console.log('Test Ended');
      // console.log(`Retrieving user details in call took ${testEndTime - testStartTime} milliseconds.`);
    }else if(req.session.loggedInRoom !== roomId){
      res.redirect('/' + roomId + '/login');
    }
  });
});

let audioStart = '';
let videoStart = '';

app.post('/:room/videoAudio', (req, res) => {
  audioStart = req.body.audioOnOff;
  videoStart = req.body.videoOnOff;
});

app.post('/:room/videoAudioSettings', (req, res) => {
   res.send({
    videoStart: videoStart,
    audioStart: audioStart
   });
});

//Loading chat messages from database
app.post('/load-messages', (req, res) => {
  // console.log('Test Started');
  // const testStartTime = performance.now();
  con.query("SELECT * FROM room WHERE room_id = '" + roomId + "'", function(err, result){
    if(err) throw err;
    res.send(JSON.stringify(result));
  });
  // const testEndTime = performance.now();
  // console.log('Test Ended');
  // console.log(`Retrieving chat messages from database took ${testEndTime - testStartTime} milliseconds.`);
});

app.get('/group/:groupName', redirectLogin, (req, res) => {
  res.render('group');
});

app.post('/group/details', redirectLogin, (req, res) => {
  let groupsLoggedInUser = req.session.user; 
  let groupsLoggedInUsername = groupsLoggedInUser.username;
  let loggedInGroup = req.session.user.loggedInGroup; 
  let groupUserDetails = {
    groupsLoggedInUsername, 
    loggedInGroup
  }
  res.send(JSON.stringify(groupUserDetails))
});

//Establishing socketio connection
io.on('connection', (socket) => {
  connections.push(socket);
  socket.on('join-room', (roomId, username, fullName, profilePic, ipAddress, userId) => {
    const participant = addParticipant(socket.id, username, fullName, profilePic, ipAddress, roomId);
    socket.join(roomId);
    io.to(participant.room).emit('room-participants', {
      room: participant.room,
      participants: getRoomParticipants(participant.room) //Adding participant to room participants array
    });
    socket.to(roomId).broadcast.emit('user-connected', {
      userId: userId, 
      username: username,
    });
    io.to(roomId).emit('createMessage', {
      message: username + " joined the call" //Creating a message with username of user who joined the call
    });
    io.to(participant.room).emit('room-participants', {
      room: participant.room,
      participants: getRoomParticipants(participant.room) //Emitting the room participants to the client
    });
    //Creating message and storing to database
    socket.on('message', (message) => {
      // console.log('Test Started');
      // const testStartTime = performance.now();
      // console.log('Server received message from client of value: ' + message);
      con.query("INSERT INTO room (room_id, username, message)" + "VALUES ('" + roomId + "','" + username + "','" + message + "')", function(err, res){
        if(err) console.log(err);
        io.to(roomId).emit('createMessage', {
          roomId: roomId,
          username: username,
          message: message
        });
        // console.log('Database query: ' + JSON.stringify(res));
        // console.log('Message emitted to room: ' + roomId + ' by: ' + username);
      });
      // const testEndTime = performance.now();
      // console.log('Test Ended');
      // console.log(`Storing message in database took ${testEndTime - testStartTime} milliseconds.`);
    }); 
    //Deleting message from database
    socket.on("delete-message", (messageId) => {
      // console.log('Test Started');
      // const testStartTime = performance.now();
      con.query("DELETE FROM room WHERE message_id ='" + messageId + "'", function(err, result){
        if(err) throw err;
        io.emit("delete-message", messageId);
      });
      // const testEndTime = performance.now();
      // console.log('Test Ended');
      // console.log(`Deleting message in database took ${testEndTime - testStartTime} milliseconds.`);
    });
    //User leaving call
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
      const participant = participantLeave(socket.id);
      //Sending message to the chat with user leaving the call
      io.to(roomId).emit('createMessage', { 
        message: username + " left the call"
      });
      //Updating room participants
      if (participant) {
        io.to(participant.room).emit('room-participants', { 
          room: participant.room,
          participants: getRoomParticipants(participant.room)
        });
      }
    });
  });

  //Groups
  socket.on('private_chat_joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.broadcast.to(user.room).emit('private_chat_message',
      formatMessage(`${user.username} has joined the chat`)
    );
    io.to(user.room).emit('private_chat_roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });
  socket.on('private_chat_chatMessage', msg => {
    // console.log('Test Started');
    // const testStartTime = performance.now();
    // console.log('Message received by server from client of value: ' + msg);
    const user = getCurrentUser(socket.id);
    // console.log('User message object: ' + JSON.stringify(user));
    io.to(user.room).emit('private_chat_message', formatMessage(user.username, msg));
    con.query("INSERT INTO group_chat (group_name, username, message)" + "VALUES ('" + user.room + "','" + user.username + "','" + msg + "')", function(err, res){     
      if(err) console.log(err);
      // console.log('Database query: ' + JSON.stringify(res));
    });

    // const testEndTime = performance.now();
    // console.log('Test Ended');
    // console.log(`Creating message in a group took ${testEndTime - testStartTime} milliseconds.`);
  });
  socket.on('private_chat_disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit('private_chat_message',
        formatMessage(`${user.username} has left the chat`)
      );
      io.to(user.room).emit('private_chat_roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));