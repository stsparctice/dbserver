const express = require('express');
const router = express.Router();
const config = require('../config.json');
const { updateConfig } = require('../modules/admin');

router.get('/', async (req, res) => {
    res.render('admin', { config });
});

router.post('/updateConfig', express.urlencoded({ extended: true }), async (req, res) => {
    _ = await updateConfig(req.body);
    res.redirect('/');
});

module.exports = router;
