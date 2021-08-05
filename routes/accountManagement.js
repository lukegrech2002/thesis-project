const express = require("express");
let router = express.Router();
const con = require('../config/connection');
const bodyParser = require('body-parser');
const { redirectLogin } = require('../config/auth');
const bcrypt = require('bcryptjs');
const fileUpload = require('express-fileupload');
const ip = require("ip");
// const {performance} = require('perf_hooks');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());
router.use(fileUpload());

router.get('/', redirectLogin, (req, res) => {
  let loggedInUser = req.session.user;
  let ipAddress = (ip.address());
  res.render('accountManagement', {
    loggedInUser,
    ipAddress
  });
});

router.post('/', redirectLogin, async (req, res) => {
  // console.log('Test Started');
  // const testStartTime = performance.now();

  let firstName = await req.body.updateFirstName;
  let lastName = await req.body.updateLastName;
  let username = await req.body.updateUsername;
  let password = await req.body.updatePassword;
  
  try {    
    const hashedPassword = await bcrypt.hash(password, 10);
    let profilePicture = await req.files.updateProfilePicture;
    let profilePictureName = profilePicture.name;

    if(profilePicture.mimetype == "image/jpeg" || profilePicture.mimetype == "image/png"){                               
      profilePicture.mv('public/uploads/' + profilePicture.name, (err) => {                
        if (err) return res.status(500).send(err);
        let sql = "UPDATE account SET first_name = ?, last_name = ?, username = ?, password = ?, profile_picture = ? WHERE email_address = '" +  req.session.user.email_address + "'";
        con.query(sql, [firstName, lastName, username, hashedPassword, profilePictureName], (err, result) => {
          if (err) throw err;
        });

        // const testEndTime = performance.now();
        // console.log('Test Ended');
	      // console.log(`Updating profile details took ${testEndTime - testStartTime} milliseconds.`);

        return res.redirect('/log-out');
    });
    }else{
      res.send("Please upload an image of type PNG or JPG");
    }
  }catch(err){
    throw (err)
  }
});

router.post('/delete-account', redirectLogin, async (req, res) => {
  try {    
    con.query("DELETE * FROM account WHERE username = '" + req.session.user.username + "'", function(err) {
      if (err) console.log(err);
      req.session.destroy();
      return res.redirect('/login');
    });
  }catch(err){
    console.log(err);
  }
});

module.exports = router;