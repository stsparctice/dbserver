const express = require('express');
const router = express.Router();
const { createSql, insertManySql, createMng, creatSqlTable } = require('../modules/create');
const { routerLogger } = require('../utils/logger');

const { updateConfig, updateConfigInFiled, updateConfig2 } = require('../modules/admin')
const { parseColumnName, parseTableName } = require('../utils/parse_name')

router.use(express.json());
router.use(routerLogger())

router.post('/create', parseTableName, parseColumnName, async (req, res) => {
    const result = await createSql(req.body);
    res.status(200).send(result);
});

router.post('/createManySql', parseTableName, parseColumnName, async (req, res) => {
    const result = await insertManySql(req.body);
    res.status(200).send(result);
});


router.post('/insertone', async (req, res) => {
    const result = await createMng(req.body);
    res.status(200).send(result);
});

module.exports = router
