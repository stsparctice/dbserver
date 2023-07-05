const express = require('express');
const router = express.Router();
// const config = require('../config.json')
const {getTableName,getColumns,getProcedures,getvalues} =require('../modules/config/createConfig')

router.use(express.json());

router.post('/config', async (req, res) => {
    const result = await getTableName(req.body);
    res.status(200).send(result);
});

router.post('/configColumns', async (req, res) => {
    const result = await getColumns(req.body);
    res.status(200).send(result);
});

router.post('/configProcedures', async (req, res) => {
    const result = await getProcedures(req.body);
    res.status(200).send(result);
});

router.post('/configValuesProcedures', async (req, res) => {
    const result = await getvalues(req.body);
    res.status(200).send(result);
});


module.exports = router
