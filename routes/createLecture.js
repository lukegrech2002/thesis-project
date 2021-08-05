const express = require("express");
const router = express.Router();
const {v4: uuidV4} = require('uuid');
const con = require('../config/connection');
const { redirectLogin, teacherPermissions } = require('../config/auth');
const ip = require("ip");
// const {performance} = require('perf_hooks');

router.get('/', redirectLogin, teacherPermissions, (req, res) => {
    let loggedInUser = req.session.user;
    let ipAddress = (ip.address());
    res.render('createLecture', {
        loggedInUser,
        ipAddress
    });
});

router.post('/', async (req, res) => {
    // console.log('Test Started');
    // const testStartTime = performance.now();

    //Receiving the request body sent by the client
    let teacher = req.session.user;
    let school = await req.body.createLectureSchool;
    let location = await req.body.createLectureLocation;
    let lectureClass = await req.body.createLectureClass;
    let subject = await req.body.createLectureSubject;
    let teacherName = teacher.first_name + " " + teacher.last_name;
    let teacherEmail = teacher.email_address;
    let startTime = await req.body.createLectureStartTime;
    let endTime = await req.body.createLectureEndTime;
    let date = await req.body.createLectureDate;
    let password = await req.body.createLectureOnlineRoomPassword;
    let additionalNotes = await req.body.createLectureAdditionalNotes; 
    let roomUUID = uuidV4();
  
    try {    
        let sql = await "INSERT INTO lecture (school, location, class, subject, teacher_name, teacher_email, start_time, end_time, date, room_uuid, room_password, additional_notes) " +
        "VALUES ('"+ school +"', '"+ location +"', '"+ lectureClass +"', '"+  subject +"','"+ teacherName +"', '"+ teacherEmail +"', '"
        + startTime +"','"+ endTime +"','"+ date +"','"+ roomUUID +"','"+ password +"','"+ additionalNotes +"')";

        con.query(sql, function (err, result) {
            if (err) throw err;
        });
        // const testEndTime = performance.now();
        // console.log('Test Ended');
        // console.log(`Lecture creation took ${testEndTime - testStartTime} milliseconds.`);
        return res.redirect('/');   
    }catch(e){
      console.log(e);
    }
});

module.exports = router;