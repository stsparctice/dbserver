const express = require('express');
const router = express.Router();
const { createSql, insertManySql, insertOne, insertMany } = require('../modules/create');
const { routerLogger } = require('../utils/logger');

// const { updateConfig, updateConfigInFiled, updateConfig2 } = require('../modules/admin')
const { parseColumnName, parseTableName, parseColumnNameMiddleware, parseListOfColumnsName } = require('../utils/parse_name');
const { routeEntityByItsType } = require('../utils/route_entity');
const { checkDataIsUnique } = require('../utils/checkunique');
const { transactionCreate } = require('../services/sql/sql-operations');

router.use(express.json());
router.use(routerLogger())

router.post('/createone', parseTableName(), parseColumnNameMiddleware(), checkDataIsUnique(), async (req, res) => {
    try {
        console.log(req.body, ' req.body')
        const response = await routeEntityByItsType(req.body, createSql, insertOne);
        res.status(201).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
});

router.post('/createmany', parseTableName(), parseListOfColumnsName(), checkDataIsUnique(), async (req, res) => {
    try {

        const response = await routeEntityByItsType(req.body, insertManySql, insertMany);
        res.status(201).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message);
    }
});

router.post('/createManyEntities', async (req, res) => {
    try {
        // const obj = [{ entityName: "Leads", values: [
        //     {supplyDate:new Date(2023, 6, 24).toISOString(),ordererCode:1,AddedDate:new Date(2023, 6, 24).toISOString(),Disable:'False'},
        //     {supplyDate:new Date(2023, 6, 24).toISOString(),ordererCode:1,AddedDate:new Date(2023, 6, 24).toISOString(),Disable:'False'}] }]
        const obj = [{
            entityName: 'unitOfMeasure', values: [{
                measure: 'meter',
                disable:'False'
            },
            {
                measure: 'ton',
                disable:'False'
            }]
        }]
        await transactionCreate(obj)
        res.send()
    }
    catch (error) {
        throw error
    }
})


module.exports = router;
