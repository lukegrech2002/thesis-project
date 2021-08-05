const express = require("express");
const router = express.Router();
const con = require('../config/connection');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fileUpload = require('express-fileupload');
const { redirectHome } = require('../config/auth');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
// const {performance} = require('perf_hooks');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
router.use(fileUpload());

router.use(cookieParser('secret'));
router.use(flash());

router.use(function(req, res, next){
  res.locals.message = req.flash();
  next();
});

router.get('/', redirectHome, (req, res) => {
  res.render('register');
});

router.post('/', async (req, res) => {
  // console.log('Test Started');
  // const testStartTime = performance.now();
  // console.log('Username received is: ' + req.body.username)

  //Receiving the request body sent by the client  
  let username = await req.body.username;
  let firstName = await req.body.firstName;
  let lastName = await req.body.lastName;
  let emailAddress = await req.body.email;
  let password = await req.body.password;
  let teacherAccount = await req.body.teacherAccount; 
  let schoolName = await req.body.schoolName;
  let schoolEnrollmentPassword = await req.body.schoolEnrollmentPassword; 

  try {
    //Hashing password with 10 salts
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log('Hashed password :' + hashedPassword);

    let profilePicture = await req.files.profilePicture;
    let profilePictureName = profilePicture.name;
    // console.log('Profile picture address :' + profilePictureName);

    con.query("SELECT * FROM account WHERE username = '" + username + "'", function(err, usernameQuery) {
      if(usernameQuery.length > 0){
        //Send error message
        req.flash('error', 'Username taken');
        return res.redirect('/register');
      }else{
        con.query("SELECT * FROM account WHERE email_address = '" + emailAddress + "'", function(err, emailQuery) {
          if(emailQuery.length > 0){
            //Send error message
            req.flash('error', 'Email already has a registered account');
            return res.redirect('/register');
          }else{
            //Validating image file type
            if(profilePicture.mimetype == "image/jpeg" ||profilePicture.mimetype == "image/png"||profilePicture.mimetype == "image/jpg" ){                               
              profilePicture.mv('public/uploads/' + profilePicture.name, function(err) {                
              if (err) return res.status(500).send(err);
              //Querying enrollment details
              con.query('SELECT * FROM school WHERE school_name = ? AND school_enrollment_password = ?', [schoolName, schoolEnrollmentPassword], 
              (err, results) => {
                if(err) throw err;
                if(results.length > 0) {
                  //Inserting user details into database
                  con.query("INSERT INTO account (username, first_name, last_name, email_address, school, password, profile_picture, teacher_account) " +
                    "VALUES ('"+ username +"', '"+ firstName +"', '"+ lastName +"', '"+ emailAddress +"', '"+ schoolName +"','"+ hashedPassword +"','"+ profilePictureName +"','"+ teacherAccount +"')", function(err, result) {
                    if (err) throw err;
                    // console.log('Database query: ' + result);
                    // console.log('Registration succesful');
                    return res.redirect('/login');
                  });

                  // const testEndTime = performance.now();
                  // console.log('Test Ended');
                  // console.log(`User registration took ${testEndTime - testStartTime} milliseconds.`);

                  }else{
                    //Send error message
                    req.flash('error', 'Incorrect school enrolment details');
                    return res.redirect('/register');
                  }
                });
              });
            }else{
              //Send error message
              req.flash('error', "This format is not allowed, please upload a profile picture of image type '.png', '.jpeg' or'.jpg'");
              return res.redirect('/register');
            }
          }
        });
      }
    });
  }catch(e){
    //Send error message
    req.flash('error', 'Please upload a profile picture');
    return res.redirect('/register');
  }
});

module.exports = router;