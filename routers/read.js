const express = require('express');
const router = express.Router();
const { getDetailsSql, getAllSql, countRowsSql, getDetailsMng,
    getDetailsWithAggregateMng, getCountDocumentsMng,
    readWithJoin, connectTables, getDetailsWithDistinct, getPolygon } = require('../modules/read');
const { getPrimaryKeyField, getForeignTableAndColumn, convertFieldType } = require('../modules/config/config')
const { routerLogger } = require('../utils/logger');
const { parseColumnName, parseTableName } = require('../utils/parse_name')
const { ObjectId } = require('mongodb');
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

router.get('/findById/:tableName/:id', async (req, res) => {
    //primaryKey value have to be int type
    try {
        const primaryKeyFiels = getPrimaryKeyField(req.params.tableName)
        const res = await getDetailsSql({ tableName: tableName, columns: '*', condition: `${primaryKeyFiels}=${req.paras.id}` })
    }
    catch (error) {
        res.status(500).send(error.message)
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
        res.status(200).send(count);
    }
    catch (error) {
        res.status(500).send(error.message)
    }
});

router.get('/readAll/:tbname/', async (req, res) => {
    try {
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
        console.log({yyyyyyyyyy: req.body});
        const response = await getDetailsMng(req.body);
        console.log({responseeeeeeeeee: response});

        res.status(200).send(response);
    }
    catch (error) {
        res.status(404).send(error.message)
    }
});



// router.post('/findme', async (req, res) => {
//     try {
//         const { collection, filter } = req.body
//         filter['_id'] = ObjectId(filter['_id'])
//         console.log('boooooo',req.body);
//         const response = await getDetailsMng({collection, filter});
//         res.status(200).send(response);
//     }
//     catch (error) {
//         res.status(404).send(error.message)
//     }
// });


router.post('/findpolygon', async (req, res) => {
    try {
        const response = await getPolygon(req.body)
        if (response)
            res.status(200).send(response);
        else {
            res.status(404).send(response);
        }
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})


router.post('/distinct', async (req, res) => {
    try {
        console.log(
            'hhhhhhhhheeeeeeeeeey',req.body
        );
        const response = await getDetailsWithDistinct(req.body);
        console.log("kkkkkkkkkkkkkk",{ response });
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
