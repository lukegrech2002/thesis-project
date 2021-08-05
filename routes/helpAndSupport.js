const express = require("express");
const router = express.Router();
const { redirectLogin } = require('../config/auth');
const ip = require("ip");

router.get('/', redirectLogin, (req, res) => {
    let loggedInUser = req.session.user;
    let ipAddress = (ip.address());
    res.render('helpAndSupport', {
        loggedInUser,
        ipAddress
    });
});

module.exports = router;