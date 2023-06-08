const express = require('express');
const router = express.Router();
const { createSql, createMng } = require('../modules/create');
const { routerLogger } = require('../utils/logger');

router.use(express.json());
router.use(routerLogger())
router.post('/create', async (req, res) => {
    const result = await createSql(req.body);
    res.status(200).send(result);
});

router.post('/insertone', async (req, res) => {
    const result = await createMng(req.body);
    res.status(200).send(result);
});

module.exports = router
