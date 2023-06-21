const express = require('express');
const router = express.Router();
const { createSql, createMng, creatSqlTable, creatNewColumn,creatSqlNameTable,creatSqlNameColumn } = require('../modules/create');
const { updateConfig, updateConfigInFiled, updateConfig2 } = require('../modules/admin')
router.use(express.json());

router.post('/create', async (req, res) => {
    const result = await createSql(req.body);
    res.status(200).send(result);
});

router.post('/insertone', async (req, res) => {
    const result = await createMng(req.body);
    res.status(200).send(result);
});

router.post('/insertColumn', async (req, res) => {
    console.log(req.body);
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
        // (creatSqlNameTable(req.body.MTDTable.name) ,"upper case" );
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

module.exports = router
