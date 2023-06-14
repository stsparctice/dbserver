const express = require('express');
const router = express.Router();
const config = require('../configCreate.json');
const { checkUserRole } = require('../modules/authorization');
const { updateConfig } = require('../modules/admin');

router.use(checkUserRole('admin'));

router.get('/', async (req, res) => {
    res.render('admin', { config });
});

router.post('/updateConfig', express.urlencoded({ extended: true }), async (req, res) => {
    _ = await updateConfig(req.body);
    res.redirect('/');
});

module.exports = router;
