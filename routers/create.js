const express = require('express');
const router = express.Router();
const { createSql, createMng } = require('../modules/create');

router.use(express.json());

router.post('/create', async (req, res) => {
    console.log({body:req.body});
    const result = await createSql(req.body);
    res.status(200).send(result);
});

router.post('/insertone', async (req, res) => {
    const result = await createMng(req.body);
    res.status(200).send(result);
});

module.exports = router
