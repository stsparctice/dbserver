const express = require('express');
const router = express.Router();
const { createSql, insertManySql, createMng, creatSqlTable } = require('../modules/create');
const { routerLogger } = require('../utils/logger');

const { updateConfig, updateConfigInFiled, updateConfig2 } = require('../modules/admin')
const { parseColumnName, parseTableName } = require('../utils/parse_name')

router.use(express.json());
router.use(routerLogger())

router.post('/create', parseTableName(), parseColumnName(), async (req, res) => {
    try {
        const result = await createSql(req.body);
        if (result.status === 201)
            res.status(201).send(result);
        else
            res.status(500).send(false)
    }
    catch(error){
        res.status(500).send(error.message)
    }

});

router.post('/createManySql', parseTableName(), parseColumnName(), async (req, res) => {
    const result = await insertManySql(req.body);
    res.status(200).send(result);
});


router.post('/insertone', async (req, res) => {
    const result = await createMng(req.body);
    res.status(200).send(result);
});

module.exports = router
