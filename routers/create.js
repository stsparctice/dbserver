const express = require('express');
const router = express.Router();
const { createSql, createMng, creatSqlTable, creatNewColumn,creatSqlNameTable,creatSqlNameColumn,insertManySql } = require('../modules/create');
const { updateConfig, updateConfigInFiled, updateConfig2 } = require('../modules/admin')
const { routerLogger } = require('../utils/logger');

const { parseColumnName, parseTableName } = require('../utils/parse_name')
const { checkDataIsUnique } = require('../utils/checkunique')

router.use(express.json());
router.use(routerLogger())

router.post('/create', parseTableName(), parseColumnName(), async (req, res) => {
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

router.post('/insertColumn', async (req, res) => {
    try {
        req.body.column.sqlName=await creatSqlNameColumn(req.body.column.name)
        const result = await creatNewColumn(req.body)
        if (result.message == "sucsses insert column")
            _ = await updateConfigInFiled(req.body.tableName, req.body.column)
        res.status(200).send(result)
    } catch (error) {
        res.status(404).send({ message: error.message })
    }
    // the result is({ message: '', data: {} })
})

router.post('/insertTable', async (req, res) => {
    try {
        req.body.MTDTable.name.sqlName=await creatSqlNameTable(req.body.MTDTable.name.name)
        const result = await creatSqlTable(req.body);
        if (result.message == 'insert sucsses') {
            _ = await updateConfig2(req.body);
        }
        res.status(200).send({ result })
    } catch (error) {
        res.status(404).send({ message: error.message })
    }

    // the result is({ message: '' //, data: {} })
})

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
