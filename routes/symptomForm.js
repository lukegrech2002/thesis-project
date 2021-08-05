const express = require("express");
const router = express.Router();
const { redirectLogin } = require('../config/auth');
const con = require('../config/connection');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const nodemailer = require('nodemailer');
require('dotenv').config();
const ip = require("ip");
let googleapis_client_id = process.env.GOOGLEAPIS_CLIENT_ID;
let googleapis_client_secret = process.env.GOOGLEAPIS_CLIENT_SECRET;
let googleapis_refresh_token = process.env.GOOGLEAPIS_REFRESH_TOKEN;
let nodemailer_user = process.env.NODEMAILER_USER;
let nodemailer_password = process.env.NODEMAILER_PASSWORD;

let school;
let location;
let subject;
let classroom;
let teacherName;
let startTime;
let endTime;
let date;
let roomUUID;
let roomPassword;
let additionalNotes;

const OAuth2Client = new OAuth2(  
    googleapis_client_id, 
    googleapis_client_secret
);

OAuth2Client.setCredentials({
    refresh_token: googleapis_refresh_token
});

const calendar = google.calendar({
    version: 'v3', 
    auth: OAuth2Client
});

let transporter = nodemailer.createTransport({
    // host: 'smtp.office365.com',
    host: 'smtp.gmail.com',
    // port: '587',
    // secureConnection: false, //true for 465, false for other ports
    auth: {
        user: nodemailer_user,
        pass: nodemailer_password
    },
    // tls:{
    //     ciphers:'SSLv3'
    // }
});

router.get('/', redirectLogin, (req, res) => {
    res.render('symptomForm', {layout: false})
});

router.post('/', (req, res) => {
    //Receiving the request body sent by the client
    school = req.body.school;
    location = req.body.location;
    subject = req.body.subject;
    classroom = req.body.class;
    teacherName = req.body.teacher_name;
    startTime = req.body.start_time;
    endTime = req.body.end_time;
    date = req.body.date;
    roomUUID = req.body.room_uuid;
    roomPassword = req.body.room_password;
    additionalNotes = req.body.additional_notes;
});

router.post('/email', (req, res) => {
    let ipAddress = (ip.address());
    let symptom1 = req.body.symptom1;
    let symptom2 = req.body.symptom2;
    let symptom3 = req.body.symptom3;
    let symptom4 = req.body.symptom4;
    let symptom5 = req.body.symptom5;
    let symptom6 = req.body.symptom6;
    let symptom7 = req.body.symptom7;
    let symptom8 = req.body.symptom8;
    let symptom9 = req.body.symptom9;
    let symptom10 = req.body.symptom10;
    let symptom11 = req.body.symptom11;
    let symptom12 = req.body.symptom12;
    let symptom13 = req.body.symptom13;
    let symptom14 = req.body.symptom14;
    let symptom15 = req.body.symptom15;
    let symptom16 = req.body.symptom16;
    let symptom17 = req.body.symptom17;
    let contact1 = req.body.contact1;
    let contact2 = req.body.contact2;
    let contact3 = req.body.contact3;
    let emailText;
    let invitedToClassroom;
    let loggedInUser = req.session.user;
    let loggedInFullName = loggedInUser.first_name + " " + loggedInUser.last_name;
    let loggedInEmailAddress = loggedInUser.email_address;

    let risk = 0;

    //Conditional Statement to check symptom form result
    if(symptom1 == "Yes"){risk +=3}if(symptom2 == "Yes"){risk +=4}if(symptom3 == "Yes"){risk +=3}
    if(symptom4 == "Yes"){risk +=5}if(symptom5 == "Yes"){risk +=8}if(symptom6 == "Yes"){risk +=8}
    if(symptom7 == "Yes"){risk +=8}if(symptom8 == "Yes"){risk +=10}if(symptom9 == "Yes"){risk +=10}
    if(symptom10 == "Yes"){risk +=8}if(symptom11 == "Yes"){risk +=6}if(symptom12 == "Yes"){risk +=6}
    if(symptom13 == "Yes"){risk +=10}if(symptom14 == "Yes"){risk +=8}if(symptom15 == "Yes"){risk +=6}
    if(symptom16 == "Yes"){risk +=10}if(symptom17 == "Yes"){risk +=5}if(contact1 == "Yes"){risk +=10}
    if(contact2 == "Yes"){risk +=10}if(contact3 == "Yes"){risk +=8}
    
    if(risk <= 10){
        invitedToClassroom = "Yes";
        emailText =  
        `<h3>Symptom Form Result</h3> <br> 
        Dear `+ loggedInFullName + `, <br> 
        <p>You have been invited to the in-person classroom. Below are the lecture's details.</p>
        <h4>Lecture Details</h4>
        School: ` + school + `<br> 
        Location: ` + location + `<br>
        Subject: ` + subject + `<br>
        Class: ` + classroom + `<br>
        Teacher Name: ` + teacherName + `<br>
        Start Time: ` + startTime + `<br>
        End Time: ` + endTime + `<br>
        Date: ` + date + `<br>
        Additional Notes: ` + additionalNotes + `<br>
        <p>
            If you would like to attend the online lecture, below are the online lecture's details.
        </p>
        <p>
            Room Link: https://` + ipAddress + `:3000/` + roomUUID + `<br> 
            Room Password: ` + roomPassword + `
        </p><br> 
        <small>
            COVID-19 APP is a free service that helps teachers and students during the pandemic. 
            Your personal details and email address will not be used for any other purpose.
        </small>
        <small>
            This is an automated e-mail, Please do not reply. If any issues are encountered, 
            visit the support page at https://localhost:3000/help-and-support.
        </small>`;
    }else{
        invitedToClassroom = "No";
        emailText = 
        `<h3>Symptom Form Result</h3> <br> 
        Dear ` + loggedInFullName + `, <br> 
        <p>
            There is a possibility that you are infected with COVID-19.  COVID-19 symptoms and severity are determined from <a href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html"><b>cdc.gov</b></a> 
            and <a href="https://patient.info/news-and-features/coronavirus-what-are-moderate-severe-and-critical-covid-19"><b>patient.info</b></a> It is highly suggested that you remain in quarantine 
            for at least 2 weeks from symptom arrival. It is also suggested that you book a COVID-19 swab test as soon as possible
            and follow guidelines. For more information, visit https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/steps-when-sick.html.
        </p>
        <h4>Online Lecture Details</h4>
        <p>
            You have been invited to the online lecture. Below are the online lecture's details.
        </p>
        <p>
            Subject: ` + subject + `<br>
            Teacher Name: ` + teacherName + `<br>
            Start Time: ` + startTime + `<br>
            End Time: ` + endTime + `<br>
            Date: ` + date + `<br>
            Room Link: https://` + ipAddress + `:3000/` + roomUUID + `<br> 
            Room Password: ` + roomPassword + `<br>
            Additional Notes: ` + additionalNotes + `
        </p><br> 
        <small>
            COVID-19 APP is a free service that helps teachers and students during the pandemic. 
            Your personal details and email address will not be used for any other purpose.
        </small>
        <small>
            This is an automated e-mail, Please do not reply. If any issues are encountered, 
            visit the support page at https://localhost:3000/help-and-support.
        </small>`;
    }

    let formSumbitDate = new Date();
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let sumbitDate = formSumbitDate.getDate() + " " + months[formSumbitDate.getMonth()] + " " + formSumbitDate.getFullYear();

    let sql = "INSERT INTO symptom_form_response (full_name, email_address, date, invited_to_classroom, headache, dry_cough, unusually_tired, sore_throat, fever, body_aches, loss_taste_smell, chest_pain_pressure, loss_speech_movement, diarrhea, skin_rashes, discolouration, difficulty_breathing, conjunctivitis, conjestion_runny_nose, nausea_vomiting, other_symptoms, contact_symptoms, contact_2weeks, travelled_2weeks) " +
    "VALUES ('"+ loggedInFullName +"', '"+ loggedInEmailAddress +"', '"+ sumbitDate +"', '"+ invitedToClassroom +"', '"+ symptom1 +"', '"+ symptom2 +"', '"+ symptom3 +"', '"+  symptom4 +"','"+ symptom5 +"', '"
    + symptom6 +"','"+ symptom7 +"','"+ symptom8 +"','"+ symptom9 +"','"+ symptom10 +"','"+ symptom11 +"','"
    + symptom12 +"','"+ symptom13 +"','"+ symptom14 +"','"+ symptom15 +"','"+ symptom16 +"','"+ symptom17 +"','"
    + contact1 +"','"+ contact2 +"','"+ contact3 +"')";
    
    let mailOptions = {
        from: '"COVID-19 APP" <scoronaapp@gmail.com>', // sender address
        to: loggedInEmailAddress,
        subject: 'Symptom Form Result',
        html: emailText
    };

    if(contact3){
        transporter.sendMail(mailOptions, (error) => {
            if (error) return console.log(error);
        });
        con.query(sql, (err, result) => {
            if (err) throw err;
        });
        let lesson = {
            school,
            location,
            subject,
            classroom,
            teacherName,
            startTime,
            endTime,
            date,
            roomUUID,
            roomPassword,
            additionalNotes,
        }
        req.session.lesson = lesson;
    }
    res.redirect('email/sent');
});

router.get('/email/sent', redirectLogin, (req, res) => {
    let loggedInUser = req.session.user;
    let loggedInEmailAddress = loggedInUser.email_address;
    res.render('emailSent', {loggedInEmailAddress});
});

convertDate = (d) => {
    let parts = d.split(" ");
    let months = {
     Jan: "01",
     Feb: "02",
     Mar: "03",
     Apr: "04",
     May: "05",
     Jun: "06",
     Jul: "07",
     Aug: "08",
     Sep: "09",
     Oct: "10",
     Nov: "11",
     Dec: "12"
    };
    return parts[3]+"-"+months[parts[1]]+"-"+parts[2];
}

router.post('/calendar-invite', redirectLogin, (req, res) => {
    let calendarEmailAddress = req.session.user.email_address;
    let calendarLesson = req.session.lesson;
    let calendarStart = calendarLesson.date + " " + calendarLesson.startTime + ":00 GMT+0100";
    let calendarEnd = calendarLesson.date + " " + calendarLesson.endTime + ":00 GMT+0100";
    let formattedCalendarStart = convertDate(calendarStart) + "T" + calendarLesson.startTime + ":00" + "Z";
    let formattedCalendarEnd = convertDate(calendarEnd) + "T" + calendarLesson.endTime + ":00" + "Z";

    const event = {
        summary: calendarLesson.subject + ' Lesson',
        location: "Classroom: " + calendarLesson.classroom + ", " +
        "School: " + calendarLesson.school + ", " +
        "Location: " + calendarLesson.location,
        description: calendarLesson.subject + ' Lesson held by ' + calendarLesson.teacherName +
        ', ' + calendarLesson.additionalNotes,
        start: {
            dateTime: formattedCalendarStart,
            timeZone: 'CET'
        },
        organiser: {
            displayName: "Covid-19 App"
        },
        end: {
            dateTime: formattedCalendarEnd,
            timeZone: 'CET'
        },
        colorId: 1,
        attendee:[{
            'email': calendarEmailAddress
        }],
        reminders: {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60}, // Email Reminder 1 day before
              {'method': 'popup', 'minutes': 15}, // Popup Reminder 15 minutes before
            ],
        },
    }

    calendar.events.insert({
        calendarId: 'primary', 
        resource: event
    }, (err) => {
            if (err) throw err;
            res.redirect('/');
        }
    );
});

module.exports = router;