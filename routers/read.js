const express = require('express');
const router = express.Router();
const { getDetailsSql, getAllSql, countRowsSql, getDetailsMng, getDetailsWithAggregateMng, getCountDocumentsMng, readWithJoin, getDetailsWithDistinct } = require('../modules/read');
const { getPrimaryKeyField } = require('../modules/config/config')
const { routerLogger } = require('../utils/logger');
const { parseColumnName, parseTableName } = require('../utils/parse_name')

router.use(express.json());
router.use(routerLogger())

router.get('/auto_complete/:table/:column/:word', async (req, res) => {
    try {
        let obj = {}
        obj.tableName = req.params.table
        obj.columns = `${req.params.column}`
        const primarykey = getPrimaryKeyField(obj.tableName)
        if (primarykey) {
            obj.columns += `,${primarykey}`
        }
        obj.condition = `${req.params.column} LIKE '${req.params.word}%'`
        obj.n = 10
        const result = await getDetailsSql(obj);
        console.log(result, "result");
        res.status(200).send(result);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
})

router.post('/readTopN', async (req, res) => {
    try {
        const table = await getDetailsSql(req.body);
        res.status(200).send(table);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.get('/readjoin/:tableName/:column', async (req, res) => {
    try {
        const response = await readWithJoin(req.params.tableName, req.params.column);
        res.status(200).send(response);
    }

    catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
});

router.post('/countRows', parseTableName, parseColumnName, async (req, res) => {
    try {
        const count = await countRowsSql(req.body);
        res.status(200).send(count);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.get('/readAll/:tbname/', async (req, res) => {
    try {
        console.log("im here");
        let obj = {};
        obj['tableName'] = req.params.tbname;
        const table = await getAllSql(obj);
        console.log(table);
        res.status(200).send(table);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.get('/readAll/:tbname/:condition', async (req, res) => {
    try {
        let obj = {};
        obj['tableName'] = req.params.tbname;
        obj['condition'] = req.params.condition;
        const table = await getAllSql(obj);
        res.status(200).send(table);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.post('/find', async (req, res) => {
    try {
        const response = await getDetailsMng(req.body);
        res.status(200).send(response);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.get('/distinct/:collection/:filter', async (req, res) => {
    try {
        console.log('distinct---------', req.params.collection, req.params.filter);
        const response = await getDetailsWithDistinct(req.params.collection, req.params.filter);
        console.log({ response });
        res.status(200).send({ response });
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.post('/aggregate', async (req, res) => {
    try {
        const response = await getDetailsWithAggregateMng(req.body);
        res.status(200).send(response);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.get('/countdocuments/:collection', async (req, res) => {
    try {
        const response = await getCountDocumentsMng(req.params.collection);
        res.status(200).send({ response });
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

module.exports = router;
