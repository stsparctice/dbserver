const express = require('express');
const router = express.Router();
const { countRowsSql,
    readFromMongo,
    getCountDocumentsMng,
    readFromSql,
    autoComplete,
    readFromSqlAndMongo,
    readFullEntity,
    readUniqueDataInMoreEntities,
    existInSql } = require('../modules/read');
const { routerLogger } = require('../utils/logger');
const { routeEntityByItsType } = require('../utils/route_entity');
const { convertQueryToObject } = require('../utils/convert_query')

router.use(express.json());
router.use(routerLogger());

router.get('/auto_complete/:entity/:column', async (req, res) => {
    try {
        const condition = convertQueryToObject(req.query)
        const response = await routeEntityByItsType({ data: { entityName: req.params.entity, condition }, sql: autoComplete });
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message)
    }

});

router.get('/uniqueindb/:entityname', async (req, res) => {
    try {
        const condition = convertQueryToObject(req.query)
        const response = await routeEntityByItsType({ data: { entityName: req.params.entityname, condition }, sql: readUniqueDataInMoreEntities });
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
})

router.get('/exists/:entityname', async (req, res) => {
    try {
        const condition = convertQueryToObject(req.query)
        const response = await routeEntityByItsType({data:{ entityName: req.params.entityname, condition },sql: existInSql});
        console.log({ response });
        if (response.length === 1) {
            res.status(200).send(response[0]);
        }
        else {
            res.status(200).send(response);
        }
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
})

router.get('/readOne/:entityname/:id', async (req, res) => {
    try {
        const condition = convertQueryToObject(req.query)
        const response = await routeEntityByItsType({data:{ entityName: req.params.entityname, condition: { id: req.params.id, ...condition }, topn: 1 },sql: readFromSql,mongo: readFromMongo});
        console.log({ response })
        if (response.length == 0) {
            res.status(200).json(null)
        }
        if (response.length >= 1) {
            res.status(200).json(response[0]);
        }
    }
    catch (error) {
        console.log(error.description)
        res.status(500).send(error.message);
    }
});

router.get('/readOne/:entityname', async (req, res) => {
    try {
        console.log(req.query)
        const condition = convertQueryToObject(req.query)
        console.log({ condition })
        const response = await routeEntityByItsType({data:{ entityName: req.params.entityname, condition, topn: 1 },sql: readFromSql, mongo:readFromMongo,transaction: readFromSqlAndMongo});
        console.log({ response })
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
})



router.post('/readOne/:entityname', async (req, res) => {
    try {
        const response = await routeEntityByItsType({data:{ entityName: req.params.entityName, condition: req.body.condition, topn: 1 },sql: readFromSql,mongo: readFromMongo});
        res.status(200).send(response);
    }
    catch (error) {
        console.log({ error });
        res.status(500).send(error.message);
    }
});

router.post('/readOneDetails/:entityname', async (req, res) => {
    console.log(req.params.entityname)
    try {
        const response = await routeEntityByItsType({data:{ entityName: req.params.entityname, condition: req.body.condition, topn: 1 },sql: readFullEntity,mongo: readFromMongo});

        console.log(response);
        if (response && response.length > 0)
            res.status(200).send(response[0]);
        else {
            res.status(200).send([])
        }
    }
    catch (error) {
        console.log({ error });
        res.status(500).send(error.message);
    }
});

router.get('/readMany/:entityname', async (req, res) => {

    try {
        let n = 50
        let skip = 0;
        if (req.query.n) {
            n = req.query.n
            req.query = [req.query].map(({ n, ...rest }) => rest)[0]
        }
        if (req.query.skip) {
            skip = req.query.skip;
            req.query = [req.query].map(({ skip, ...rest }) => rest)[0]

        }

        console.log({ entityname: req.params.entityname });
        const condition = convertQueryToObject(req.query)
        let response = await routeEntityByItsType({data:{ entityName: req.params.entityname, topn: n, condition },sql: readFromSql,mongo: readFromMongo,transaction: readFromSqlAndMongo});
        res.status(200).send(response)
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error.message)
    }
});

router.post('/readMany/:entityname', async (req, res) => {
    try {
        const { condition, fields, topn, skip } = req.body
        let response = await routeEntityByItsType({data:{ entityName: req.params.entityname, condition, fields, topn: topn ? topn : 100, skip: skip ? skip : 0 },sql: readFromSql, mongo:readFromMongo,transaction: readFromSqlAndMongo});
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
})

router.post('/count/:entityname', async (req, res) => {
    try {
        let response = await routeEntityByItsType({ entityName: req.params.entityName, condition: req.body.condition }, countRowsSql, getCountDocumentsMng);
        res.status(200).send(response);
    }
    catch (error) {
        res.status(500).send(error.message);
    }

});

module.exports = router;
