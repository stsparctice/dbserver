const express = require('express');
const router = express.Router();
const { getDetailsSql, getAllSql, countRowsSql, getDetailsMng, getDetailsWithAggregateMng, getCountDocumentsMng,getDetailsWithDistinct } = require('../modules/read');
const { routerLogger } = require('../utils/logger');

router.use(express.json());
router.use(routerLogger())
router.post('/readTopN', async (req, res) => {
    const table = await getDetailsSql(req.body);
    res.status(200).send(table);
});

router.post('/countRows', async (req, res) => {
    const count = await countRowsSql(req.body);
    res.status(200).send(count);
});

router.get('/readAll/:tbname/', async (req, res) => {
    let obj = {};
    obj['tableName'] = req.params.tbname;
    const table = await getAllSql(obj);
    console.log(table);
    res.status(200).send(table);
});

router.get('/readAll/:tbname/:condition', async (req, res) => {
    let obj = {};
    obj['tableName'] = req.params.tbname;
    obj['condition'] = req.params.condition;
    console.log(obj['condition']);
    const table = await getAllSql(obj);
    console.log(table);
    res.status(200).send(table);
});

router.post('/find', async (req, res) => {
    const response = await getDetailsMng(req.body);
    res.status(200).send(response);
});

router.get('/distinct/:collection/:filter', async (req, res) => {
    console.log('distinct---------',req.params.collection,req.params.filter);
    const response = await getDetailsWithDistinct(req.params.collection,req.params.filter);
    console.log({response});
    res.status(200).send({response});
});

router.post('/aggregate', async (req, res) => {
    const response = await getDetailsWithAggregateMng(req.body);
    res.status(200).send(response);
});

router.get('/countdocuments/:collection', async (req, res) => {
    const response = await getCountDocumentsMng(req.params.collection);
    res.status(200).send({ response });
});

module.exports = router;
