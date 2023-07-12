const express = require('express');
const router = express.Router();
const { getDetailsSql, getAllSql, countRowsSql, getDetailsMng,
    getDetailsWithAggregateMng, getCountDocumentsMng,
    readWithJoin, readFullObjects, readRelatedObjects, connectTables, getDetailsWithDistinct, getPolygon } = require('../modules/read');
const { getPrimaryKeyField, getForeignTableAndColumn, convertFieldType } = require('../modules/config/config')
const { routerLogger } = require('../utils/logger');
const { parseColumnName, parseTableName } = require('../utils/parse_name')

router.use(express.json());
router.use(routerLogger())

router.get('/auto_complete/:table/:column/:word/:condition', async (req, res) => {
    let obj = {}
    obj.tableName = req.params.table
    obj.columns = `${req.params.column}`
    obj.condition = `${req.params.column} LIKE N'%${req.params.word}%'`
    if (req.params.condition.trim() != "1=1") {
        obj.condition += "AND " + req.params.condition
        // console.log(obj.condition);
    }
    const primarykey = getPrimaryKeyField(obj.tableName)
    if (primarykey) {
        obj.columns += `,${primarykey}`
    }
    obj.n = 10
    const result = await getDetailsSql(obj);
    res.status(200).send(result);

})

router.get('/exist/:tablename/:field/:value', async (req, res) => {

    try {
        
        const { tablename, field, value } = req.params
        let val = convertFieldType(tablename, field, value)
        console.log({ val })
        const result = await getDetailsSql({ tableName: tablename, columns: '*', condition: `${field} = ${val}` })
        console.log({ result })
        res.status(200).send(result)
    }
    catch (error) {
        res.status(500).send(error.message)
    }

})

router.get('/readAllEntity/:entity', async (req, res) => {
    try {
        let obj = {};
        obj['tableName'] = req.params.entity;
        console.log({ obj })
        const fullObjects = await readFullObjects(req.params.entity)
        console.log(fullObjects)
        let condition = req.query? req.query : {}
        // if (req.query) {
        //     const entries = Object.entries(req.query)
        //     const conditions = entries.map(con => `${req.params.entity}.${con[0]}= ${con[1]}`)
        //     condition = conditions.join(' AND ')
        // }
        // condition = condition.length > 0 ? condition : "1=1"
        if (fullObjects.length === 0) {
            const response = await connectTables(req.params.entity, condition)
            res.status(200).send(response)
        }
        // console.log(table);
    }
    catch (error) {
        res.status(500).send(error.message)
    }
});

router.get('/readAll/:entity', async (req, res) => {
    try {
        let obj = {};
        obj['tableName'] = req.params.entity;
        const table = await getAllSql(obj);
        res.status(200).send(table);
    }
    catch (error) {
        console.log(error.message)
        res.status(404).send(error.message)
    }
})


// 'read/readTopN', obj

router.post('/readTopN', async (req, res) => {
    try {
        const table = await getDetailsSql(req.body);
        res.status(200).send(table);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});

router.get('/findRecordById/:entity/:id', async (req, res) => {
    //primaryKey value have to be int type
    try {
        const primaryKeyFiels = getPrimaryKeyField(req.params.entity)
        const response = await getDetailsSql({ tableName: entity, columns: '*', condition: `${primaryKeyFiels}=${req.paras.id}` })
        res.status(response.status).send(response.data)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/findEntityById/:entity/:id', async (req, res) => {
    try {
        const primaryKeyField = getPrimaryKeyField(req.params.entity)
        const fullObjects = await readFullObjects(req.params.entity)

        if (fullObjects.length == 0) {
            let condition = `${req.params.entity}.${primaryKeyField}=${req.params.id}`
            const response = await connectTables(req.params.entity, condition)

            res.status(200).send(response)
        }
        else {

            const response = await readRelatedObjects(req.params.entity, primaryKeyField, req.params.id, fullObjects)
            res.status(200).send(response);
        }
        //check in function if the table has type: refernces, and if not to call the function of ruty, else to call to function-getDetailsSql to call to function 
        //that change the field- tablename to object of the id
    }
    catch (error) {
        res.status(500).send(error.message);
    }

})

router.get('/readjoin/:tableName/:column', async (req, res) => {
    try {
        const response = await readWithJoin(req.params.tableName, req.params.column);
        res.status(200).send(response);
    }
    catch (error) {
        // console.log(error);
        res.status(404).send(error);
    }
});

// router.get('/foreignkeyvalue/:tablename/:fields/:value', (req, res)=>{
// const response =getObjectWithFeildNameForPrimaryKey()

// })

router.get('/foreignkeyvalue/:tablename/:field/:id', async (req, res) => {
    try {
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
    }
    catch (error) {
        res.status(500).send(error.message)
    }
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

router.post('/countRows', parseTableName(), async (req, res) => {
    try {
       
        const count = await countRowsSql(req.body);
        console.log({count})
        res.status(200).send(count);
    }
    catch (error) {
        res.status(500).send(error.message)
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

router.post('/findpolygon', async (req, res) => {
    try {
        const response = await getPolygon(req.body)
        console.log({ response })
        console.log(response.length)
        if (response)
            res.status(200).send(response)
        else {
            res.status(404).send(response)
        }
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})


router.get('/distinct/:collection/:filter', async (req, res) => {
    try {
        // console.log('distinct---------', req.params.collection, req.params.filter);
        const response = await getDetailsWithDistinct(req.params.collection, req.params.filter);
        res.status(200).send(response);
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
