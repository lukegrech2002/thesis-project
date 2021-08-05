const express = require("express");
const router = express.Router();
const { redirectLogin, studentPermissions } = require('../config/auth');
const con = require('../config/connection');
const ip = require("ip");
let data = [];

router.get('/', redirectLogin, studentPermissions, async (req, res) => {
    let loggedInUser = req.session.user;
    let ipAddress = (ip.address());
    con.query("SELECT * FROM account WHERE school = '" + loggedInUser.school + "' AND teacher_account = 'yes'", (err, rows) => {
        if(err) throw err;
        data = rows;
    });
    setTimeout(function () {
        try{
            res.render('teacherDetails', { 
                loggedInUser,
                ipAddress,
                data 
            });
        }catch(err){
            throw (err);
        }
    }, 250); 
});

module.exports = router;