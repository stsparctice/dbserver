const express = require('express');
const router = express.Router();
const { checkmember } = require('../modules/authorization');

router.post('/', express.urlencoded({ extended: true }), (req, res) => {
    const member = checkmember(req.body);
    if (member.role) {
        req.session.username = member.username;
        req.session.role = member.role;
        res.status(200).redirect(`/${member.role}`);
    }
    else {
        res.redirect('/');
    };
});

module.exports = router;
