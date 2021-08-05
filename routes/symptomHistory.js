const express = require("express");
const router = express.Router();
const { redirectLogin } = require('../config/auth');
const con = require('../config/connection');
const ip = require("ip");
let data = [];

router.get('/', redirectLogin, async (req, res) => {
    let loggedInUser = req.session.user;
    let ipAddress = (ip.address());
    con.query("SELECT * FROM symptom_form_response WHERE email_address = '" + loggedInUser.email_address + "'", (err, rows) => {
            if(err) throw err;
            data = rows;
    });
    setTimeout(function () {
        try{
            res.render('symptomHistory', { 
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