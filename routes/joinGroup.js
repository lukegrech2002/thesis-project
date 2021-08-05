const express = require("express");
const router = express.Router();
const con = require('../config/connection');
const { redirectLogin } = require('../config/auth');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const ip = require("ip");
// const {performance} = require('perf_hooks');

router.use(cookieParser('secret'));
router.use(flash());

router.use(function(req, res, next){
  res.locals.message = req.flash();
  next();
});

router.get('/', redirectLogin, (req, res) => {
  let loggedInUser = req.session.user;
  let ipAddress = (ip.address());
  res.render('joinGroup', {
    loggedInUser,
    ipAddress
  });
});

router.post('/', redirectLogin, (req, res) => {
  // console.log('Test Started');
  // const testStartTime = performance.now();

  let groupName = req.body.groupName;
  let groupPassword = req.body.groupPassword;

  con.query('SELECT * FROM groups WHERE group_name = ? AND group_password = ?', [groupName, groupPassword], 
    (err, results) => {
    if(err) throw err;
    if(results.length > 0) {
      req.session.user.loggedInGroup = groupName;

      // const testEndTime = performance.now();
      // console.log('Test Ended');
      // console.log(`Joining group took ${testEndTime - testStartTime} milliseconds.`);

      res.redirect('/group/' + groupName);
    }else{
      //Send error message
      req.flash('error', 'Incorrect details');
      return res.redirect('/join-group');
    }   
    res.end();
  });
});

module.exports = router;