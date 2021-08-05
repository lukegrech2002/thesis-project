const express = require("express");
const router = express.Router();
const con = require('../config/connection');
const bodyParser = require('body-parser');
const { redirectHome } = require('../config/auth');
// const {performance} = require('perf_hooks');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

router.get('/', redirectHome, (req, res) => {
  res.render('registerSchool');
});

router.post('/', async (req, res) => {
    // console.log('Test Started');
    // const testStartTime = performance.now();
    // console.log('School Name: ' + req.body.schoolName);

    //Receiving the request body sent by the client 
    let schoolName = await req.body.schoolName;
    let schoolEnrollmentPassword = await req.body.schoolEnrollmentPassword;

    try {   
        let sql = "INSERT INTO school (school_name, school_enrollment_password) " +
        "VALUES ('"+ schoolName +"', '"+ schoolEnrollmentPassword +"')";
        con.query(sql, function(err, result) {
        if (err) throw err;
        // console.log('Database query: ' + JSON.stringify(result));
        // console.log('School registration success');
        // const testEndTime = performance.now();
        // console.log('Test Ended');
        // console.log(`School registration took ${testEndTime - testStartTime} milliseconds.`);
        return res.redirect('/login');
    });
    }catch(err){
        console.log(err);
        return res.redirect('/school-registration');
    }
});

module.exports = router;