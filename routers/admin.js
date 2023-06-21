const express = require('express');
const router = express.Router();
const config = require('../config2.json');
const { checkUserRole } = require('../modules/authorization');
const { updateConfig } = require('../modules/admin');
const { routerLogger } = require('../utils/logger');

router.use(routerLogger())

router.use(checkUserRole('admin'));

router.get('/', async (req, res) => {
    res.render('admin', { config });
});

router.post('/updateConfig', express.urlencoded({ extended: true }), async (req, res) => {
    _ = await updateConfig(req.body);
    res.redirect('/');
});

module.exports = router;
