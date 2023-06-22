const express = require('express');
const router = express.Router();
const { getDetailsSql, getAllSql, countRowsSql, getDetailsMng,
    getDetailsWithAggregateMng, getCountDocumentsMng,
    readWithJoin, connectTables, getDetailsWithDistinct } = require('../modules/read');
const { getPrimaryKeyField, getForeignTableAndColumn } = require('../modules/config/config')
const { routerLogger } = require('../utils/logger');
const { parseColumnName, parseTableName } = require('../utils/parse_name')

router.use(express.json());
router.use(routerLogger())

router.get('/auto_complete/:table/:column/:word/:condition', async (req, res) => {
    let obj = {}
    obj.tableName = req.params.table
    obj.columns = `${req.params.column},Id`
    obj.condition = `${req.params.column} LIKE '${req.params.word}%'`
    if (req.params.condition != "AND 1=1") {
        obj.condition += req.params.condition
        console.log(obj.condition);
    }
    const primarykey = getPrimaryKeyField(obj.tableName)
    if (primarykey) {
        obj.columns += `,${primarykey}`
    }
    obj.n = 10
    const result = await getDetailsSql(obj);
    console.log(result, "result");
    res.status(200).send(result);

})

router.post('/readTopN', async (req, res) => {
    const table = await getDetailsSql(req.body);
    res.status(200).send(table);
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

// router.get('/foreignkeyvalue/:tablename/:fields/:value', (req, res)=>{
// const response =getObjectWithFeildNameForPrimaryKey()

// })

router.get('/foreignkeyvalue/:tablename/:field/:id', async (req, res) => {
    const { foreignTableName, defaultColumn } = getForeignTableAndColumn(req.params.tablename, req.params.field)
    let obj = {}
    obj.tableName = foreignTableName
    obj.columns = `${defaultColumn}`
    const primarykey = getPrimaryKeyField(foreignTableName)
    if (primarykey) {
        obj.columns += `,${primarykey}`
    }
    obj.condition = `${primarykey} = ${req.params.id}`
    obj.n = 1
    const result = await getDetailsSql(obj);
    console.log(result, "result");
    res.status(200).send(result);
})

router.get('/connectTables/:tableName/:condition', async (req, res) => {
    try {
        const response = await connectTables(req.params.tableName, req.params.condition);
        res.status(200).send(response);
    }
    catch (error) {
        res.status(404).send(error);
    }
});

router.post('/countRows', parseTableName, parseColumnName, async (req, res) => {
    const count = await countRowsSql(req.body);
    res.status(200).send(count);
});

router.get('/readAll/:tbname/', async (req, res) => {
    let obj = {};
    obj['tableName'] = req.params.tbname;
    const table = await getAllSql(obj);
    res.status(200).send(table);
});

router.get('/readAll/:tbname/:condition', async (req, res) => {
    let obj = {};
    console.log(req.params.condition, "condition");
    obj['tableName'] = req.params.tbname;
    obj['condition'] = req.params.condition;
    const table = await getAllSql(obj);
    res.status(200).send(table);
});

router.post('/find', async (req, res) => {
    const response = await getDetailsMng(req.body);
    res.status(200).send(response);
});

router.get('/distinct/:collection/:filter', async (req, res) => {
    console.log('distinct---------', req.params.collection, req.params.filter);
    const response = await getDetailsWithDistinct(req.params.collection, req.params.filter);
    console.log({ response });
    res.status(200).send({ response });
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
