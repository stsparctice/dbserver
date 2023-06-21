const express = require('express');
const router = express.Router();
const { createSql, createMng, creatSqlTable, creatNewColumn } = require('../modules/create');
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
    const result = await creatNewColumn(req.body)
    if (result.message == "sucsses insert column")
        _ = await updateConfigInFiled(req.body.tableName, req.body.column)
    res.status(200).send(result)
    // the result is({ message: '', data: {} })
})

router.post('/insertTable', async (req, res) => {
    const result = await creatSqlTable(req.body);
    if (result.message == 'insert sucsses') {
        _ = await updateConfig2(req.body);
    }
    res.status(200).send({ result })
    // the result is({ message: '', data: {} })
})

module.exports = router
