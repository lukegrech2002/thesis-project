const express = require("express");
const router = express.Router();
const { redirectLogin } = require('../config/auth');
const ip = require("ip");
const con = require('../config/connection');

router.get(['/', '/home'], redirectLogin, (req, res) => { 
    let loggedInUser = req.session.user;
    let ipAddress = (ip.address());
    res.render('index', {
        loggedInUser,
        ipAddress
    });
});

router.get('/log-out', (req, res) => {
    con.query("UPDATE account SET status = ? WHERE email_address = '" +  req.session.user.email_address + "'", ['offline'], (err, result) => {
        if (err) throw err;
    });
    req.session.destroy();
    return res.redirect('/login');
});

module.exports = router;