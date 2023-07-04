const express = require('express');
const router = express.Router();
const { createSql, insertManySql, createMng, creatSqlTable } = require('../modules/create');
const { routerLogger } = require('../utils/logger');

const { updateConfig, updateConfigInFiled, updateConfig2 } = require('../modules/admin')
const { parseColumnName, parseTableName } = require('../utils/parse_name')
const { checkDataIsUnique } = require('../utils/checkunique')

router.use(express.json());
router.use(routerLogger())

router.post('/create', parseTableName(), parseColumnName(), checkDataIsUnique(), async (req, res) => {
    try {
        const result = await createSql(req.body);
        if (result)
            res.status(201).send(result);
        else
            res.status(500).send(false)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
});

router.post('/createManySql', parseTableName(), async (req, res) => {
    try {
        const result = await insertManySql(req.body);
        res.status(201).send(result);
    }
    catch (error) {
        res.status(500).send(error.message);

    }
});


router.post('/insertone', async (req, res) => {
    try {
        const result = await createMng(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        res.send(error.message)
    }
});

module.exports = router
