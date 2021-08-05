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
    res.render('createGroup', {
        loggedInUser,
        ipAddress
    });
});

router.post('/', async (req, res) => {
    // console.log('Test Started');
    // const testStartTime = performance.now();
  
    let groupName = await req.body.createGroupName;
    let password = await req.body.createGroupPassword;
    let administrator = req.session.user.first_name + " " + req.session.user.last_name;

    try {    
        con.query("SELECT * FROM groups WHERE group_name = '" + groupName + "'", function(err, groupNameQuery) {
            if(groupNameQuery.length > 0){
              //Send error message
              req.flash('error', 'Group name already taken');
              return res.redirect('/create-group');
            }else{
                let sql = "INSERT INTO groups (group_name, group_password, administrator) " +
                "VALUES ('"+ groupName +"', '"+ password +"', '"+ administrator + "')";
                con.query(sql, (err, result) => {
                    if (err) throw err;
                    req.flash('success', 'Group created');
                    return res.redirect('/create-group');
                });

                // const testEndTime = performance.now();
                // console.log('Test Ended');
	            // console.log(`Group creation took ${testEndTime - testStartTime} milliseconds.`);

            }
        });   
    }catch(e){
      console.log(e);
    }
});

module.exports = router;