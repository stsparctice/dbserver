const express = require('express');
const { parseTableName, parseColumnName } = require('../utils/parse_name');
const router = express.Router();
const { updateSql,updateOneSql, updateQuotationSql, updateSuppliersBranchesSql, updateMng ,dropCollectionMng} = require('../modules/update');
const { routerLogger } = require('../utils/logger');

router.use(express.json());
router.use(routerLogger())

router.post('/update', parseTableName(), parseColumnName(), async (req, res) => {
    try {
        const result = await updateSql(req.body);
        res.status(204).send(result);
    }
    catch (error) {
        res.status(500).send(error.message)
    }
});

router.post('/updateOne', async (req, res) => {    
    const result = await updateOneSql(req.body);
    res.status(200).send(result);
});

router.post('/updateQuotation', parseTableName, parseColumnName, async (req, res) => {
    try {
        const result = await updateQuotationSql(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});


router.post('/updateSuppliersBranches', parseTableName, parseColumnName, async (req, res) => {
    try {
        const result = await updateSuppliersBranchesSql(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.post('/updateone', async (req, res) => {
    try {
        const result = await updateMng(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.post('/dropCollection', async (req, res) => {
    try {
        const result = await dropCollectionMng(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.post('/dropDocument', async (req, res) => {
    console.log("req.body",req.body);
    const result = await dropDocumentMng(req.body);
    res.status(200).send(result);
});

module.exports = router;
