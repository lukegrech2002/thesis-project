const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const con = require('../config/connection');
const bodyParser = require('body-parser');
const { redirectHome } = require('../config/auth');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
// const {performance} = require('perf_hooks');

let loggedInUserDetails = [];

//Body parser for POST
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.use(cookieParser('secret'));
router.use(flash());

router.use(function(req, res, next){
  res.locals.message = req.flash();
  next();
});

router.get('/', redirectHome, function (req, res, next){
  res.render('login');
});

router.post('/', async (req, res) => {
  // console.log('Test Started');
  // const testStartTime = performance.now();
  // console.log('Username request: ' + req.body.loginUsername);

  //Receiving the request body sent by the client
  let loginUsername = req.body.loginUsername;
  let loginPassword = req.body.loginPassword;
  let hashedPassword = [];
  
  //Querying database for username
  await con.query("SELECT * FROM account WHERE username = '" + loginUsername + "'", function(err, resultQuery1){
    if(err) throw err;
    if (resultQuery1.length > 0){
      //Querying database for password of the entered username
      con.query("SELECT password FROM account WHERE username = '" + loginUsername + "'", (err, row) => {
        if(err) throw err;
        for (var i of row) {
          hashedPassword.push(i);
          //Comparing the hashed password
          bcrypt.compare(loginPassword, hashedPassword[0].password, (err, resultQuery2) => {
            if (err) throw err;
            if (resultQuery2){
              // Saving the logged in user in session storage     
              // console.log('1st database query result: ' + JSON.stringify(resultQuery1)); 
              loggedInUserDetails = Object.assign({}, ...resultQuery1);
              req.session.user = loggedInUserDetails;
              con.query("UPDATE account SET status = ? WHERE email_address = '" +  req.session.user.email_address + "'", ['online'], (err, result) => {
                if (err) throw err;
              });
              // console.log('The user object in the session is: ' + JSON.stringify(req.session.user));           
              // const testEndTime = performance.now();
              // console.log('Test Ended');
	            // console.log(`Login took ${testEndTime - testStartTime} milliseconds.`);
              return res.redirect('/');
            }else{
              //Send error message
              req.flash('error', 'Incorrect Password');
              return res.redirect('/login');
            }
          });
        }
      });
    }else{
      //Send error message
      req.flash('error', 'Inexistent Username');
      return res.redirect('/login');
    }
  });
});

module.exports = router;
