const express = require('express');
const router = express.Router();
const { updateSql, updateQuotationSql, updateSuppliersBranchesSql, updateMng ,dropCollectionMng} = require('../modules/update');

router.use(express.json());

router.post('/update', async (req, res) => {
    const result = await updateSql(req.body);
    console.log(req.body);
    res.status(200).send(result);
});

router.post('/updateQuotation', async (req, res) => {
    const result = await updateQuotationSql(req.body);
    res.status(200).send(result);
});

router.post('/updateSuppliersBranches', async (req, res) => {
    const result = await updateSuppliersBranchesSql(req.body);
    res.status(200).send(result);
});

router.post('/updateone', async (req, res) => {
    const result = await updateMng(req.body);
    res.status(200).send(result);
});

router.post('/dropCollection', async (req, res) => {
    const result = await dropCollectionMng(req.body);
    res.status(200).send(result);
});

module.exports = router;
