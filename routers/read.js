const express = require('express');
const router = express.Router();
const { getDetailsSql, getAllSql, countRowsSql, getDetailsMng,
    getDetailsWithAggregateMng, getCountDocumentsMng,
    readWithJoin, connectTables, getDetailsWithDistinct } = require('../modules/read');
const { getPrimaryKeyField, getForeignTableAndColumn, convertFieldType } = require('../modules/config/config')
const { routerLogger } = require('../utils/logger');
const { parseColumnName, parseTableName } = require('../utils/parse_name')
const { Log } = require('../services/log/log');

router.use(express.json());
router.use(routerLogger())
// router.use(Log())

router.get('/auto_complete/:table/:column/:word/:condition', async (req, res) => {
    let object = [{
        method: "get",
        name: "auto_complete",
        path: "routers /read",
        body: req.params
    }]


    let obj = {}
    obj.tableName = req.params.table
    obj.columns = `${req.params.column}`
    obj.condition = `${req.params.column} LIKE '%${req.params.word}%'`
    if (req.params.condition.trim() != "1=1") {
        obj.condition += "AND " + req.params.condition
        // console.log(obj.condition);
    }
    const primarykey = getPrimaryKeyField(obj.tableName)
    if (primarykey) {
        obj.columns += `,${primarykey}`
    }
    obj.n = 10

    const result = await getDetailsSql(obj, object);
    res.status(200).send(result);

})

router.get('/exist/:tablename/:field/:value', async (req, res) => {

    try {
        let object = [{
            method: "get",
            name: "exist",
            path: "routers /read",
            body: req.params
        }]

        const { tablename, field, value } = req.params
        let val = convertFieldType(tablename, field, value)
        const result = await getDetailsSql({ tableName: tablename, columns: '*', condition: `${field} = ${val}` }, object)
        console.log({ result })
        res.status(200).send(result)
    }
    catch (error) {
        object.error = error.message
        res.status(500).send(error.message)
    }

})
router.post('/readTopN', async (req, res) => {
    try {
        // let object = [{
        //     method:"post",
        //     name: "readTopN",
        //     path: "routers /read",
        //     body: req.body
        // }]

        // Log(object)
        // Logger(req.body)
        // const table = await getDetailsSql(req.body,object);
        const table = await getDetailsSql(req.body);

        res.status(200).send(table);
    }

    catch (error) {
        // object.error = error.message
        // Log(object)
        res.status(404).send(error.message)
    }
});

router.get('/findById/:tableName/:id', async (req, res) => {

    //primaryKey value have to be int type
    try {
        let object = [{
            method: "get",
            name: "findById",
            path: "routers /read",
            body: req.params
        }]

        const primaryKeyFiels = getPrimaryKeyField(req.params.tableName)
        const res = await getDetailsSql({ tableName: tableName, columns: '*', condition: `${primaryKeyFiels}=${req.paras.id}` }, object)
    }
    catch (error) {
        object.error = error.message
        res.status(500).send(error.message)
    }
})

router.get('/readjoin/:tableName/:column', async (req, res) => {
    try {
        let object = [{
            method: "get",
            name: "readjoin",
            path: "routers /read",
            body: req.params
        }]

        const response = await readWithJoin(req.params.tableName, req.params.column, object);
        res.status(200).send(response);
    }

    catch (error) {
        // console.log(error);
        object.error = error.message
        res.status(404).send(error);
    }
});

// router.get('/foreignkeyvalue/:tablename/:fields/:value', (req, res)=>{
// const response =getObjectWithFeildNameForPrimaryKey()

// })

router.get('/foreignkeyvalue/:tablename/:field/:id', async (req, res) => {

    // let object = [{
    //     method:"get",
    //     name: "foreignkeyvalue",
    //     path: "routers /read",
    //     body: req.params
    // }]
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
    res.status(200).send(result);
})

router.get('/connectTables/:tableName/:condition', async (req, res) => {
    try {
        let object = [{
            method: "get",
            name: "connectTables",
            path: "routers /read",
            body: req.params
        }]
        const response = await connectTables(req.params.tableName, req.params.condition, object);
        res.status(200).send(response);
    }
    catch (error) {
        object.error = error.message
        res.status(404).send(error);
    }
});

router.post('/countRows', parseTableName, parseColumnName, async (req, res) => {
    try {
        let object = [{
            method: "get",
            name: "countRows",
            path: "routers /read",
            body: req.body
        }]
        const count = await countRowsSql(req.body, object);
        res.status(200).send(count);
    }
    catch (error) {
        object.error = error.message
        res.status(404).send(error.message)
    }
});
// `read/readAll/tbl_Leads/${obj.condition}

router.get('/readAll/:tbname/', async (req, res) => {
    try {
        // let object = [{
        //     method:"get",
        //     name: "readAll",
        //     path: "routers /read",
        //     body: req.params
        // }]
        let obj = {};
        obj['tableName'] = req.params.tbname;
        const table = await getAllSql(obj);
        res.status(200).send(table);
    }
    catch (error) {
        object.error = error.message
        res.status(404).send(error.message)
    }
});
// read/readAll/tbl_Leads/${obj.condition}
// read/readAll/tbl_Leads/Id=2`
router.get('/readAll/:tbname/:condition', async (req, res) => {
    try {
        // let object = [{
        //     method:"get",
        //     name: "readAll",
        //     path: "routers /read",
        //     body: req.params
        // }]
        let obj = {};
        obj['tableName'] = req.params.tbname;
        obj['condition'] = req.params.condition;
        const table = await getAllSql(obj);
        res.status(200).send(table);
    }
    catch (error) {
        // object.error = error.message
        res.status(404).send(error.message)
    }
});

router.post('/find', async (req, res) => {
    try {
        let object = [{
            method: "post",
            name: "find",
            path: "routers /read",
            body: req.body
        }]
        //
        const response = await getDetailsMng(req.body, object);
        //
        res.status(200).send(response);
    }
    catch (error) {
        object.error = error.message
        res.status(404).send(error.message)
    }
});

router.get('/distinct/:collection/:filter', async (req, res) => {
    try {
        let object = [{
            method: "get",
            name: "distinct",
            path: "routers /read",
            body: req.params
        }]
        Log(object)
        console.log('distinct---------', req.params.collection, req.params.filter);
        const response = await getDetailsWithDistinct(req.params.collection, req.params.filter, object);
        console.log({ response });
        res.status(200).send({ response });
    }
    catch (error) {
        object.error = error.message
        res.status(404).send(error.message)
    }
});

router.post('/aggregate', async (req, res) => {
    try {
        let object = [{
            method: "post",
            name: "aggregate",
            path: "routers /read",
            body: req.body
        }]
        const response = await getDetailsWithAggregateMng(req.body, object);
        res.status(200).send(response);
    }
    catch (error) {
        object.error = error.message
        res.status(404).send(error.message)
    }
});

router.get('/countdocuments/:collection', async (req, res) => {
    try {
        let object = [{
            method: "get",
            name: "countdocuments",
            path: "routers /read",
            body: req.params
        }]
        const response = await getCountDocumentsMng(req.params.collection, object);
        res.status(200).send({ response });
    }
    catch (error) {
        object.error = error.message
        res.status(404).send(error.message)
    }
});

module.exports = router;
