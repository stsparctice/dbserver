const express = require('express');
const router = express.Router();
const { createSql, insertManySql, creatSqlTable, insertOne, insertMany } = require('../modules/create');
const { routerLogger } = require('../utils/logger');

const { updateConfig, updateConfigInFiled, updateConfig2 } = require('../modules/admin')
const { parseColumnName, parseTableName } = require('../utils/parse_name');
const { routeEntityByItsType } = require('../utils/route_entity');
const { checkDataIsUnique } = require('../utils/checkunique')

router.use(express.json());
router.use(routerLogger())

router.post('/createOne', parseTableName(), parseColumnName(), async (req, res) => {
    try {
        const response = await routeEntityByItsType(req.body, createSql, insertOne);
        res.status(201).send(response);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/createmany',parseTableName(),async(req,res)=>{
    try{

        const response = await routeEntityByItsType(req.body, insertManySql, insertMany);
        res.status(201).send(response);
    }
    catch (error) {
        res.status(error.status).send(error.message)
    }
});

module.exports = router
