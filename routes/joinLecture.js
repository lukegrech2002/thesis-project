const express = require("express");
const router = express.Router();
const con = require('../config/connection');
const { redirectLogin } = require('../config/auth');
const ip = require("ip");
let data = [];
let latestEnrolment;
// const {performance} = require('perf_hooks');

router.get('/', redirectLogin, async (req, res) =>{
    // console.log('Test Started');
    // const testStartTime = performance.now();
    let loggedInUser = req.session.user;
    let ipAddress = (ip.address());

    con.query("SELECT * FROM lecture WHERE school = '" + loggedInUser.school + "'", (err, rows) => {
        if(err) throw (err);
        data = rows;
    });
    setTimeout(function () {
        try{
            res.render('joinLecture', { 
               loggedInUser,
                ipAddress,
                data,
                latestEnrolment
            });
            // const testEndTime = performance.now();
            // console.log('Test Ended');
            // console.log(`Loading lectures took ${testEndTime - testStartTime} milliseconds.`);
        }catch(err){
            console.log(err);
        }
    }, 250); 
});

router.get("/search", (req, res) => {
    // console.log('Test Started');
    // const testStartTime = performance.now();

    let subjectSearch = req.query.findLectureSubject;
    let subject = (el) => {
        return el.subject === subjectSearch;
    };
    let subjectSearchResults = data.filter(subject);
    let mappedResults = subjectSearchResults.map((o, i) => ({ id: i + 1, ...o }));
    res.render("lectureSearch", {
        searchData: mappedResults
    });
    // const testEndTime = performance.now();
    // console.log('Test Ended');
    // console.log(`Lecture search took ${testEndTime - testStartTime} milliseconds.`);
});

module.exports = router;