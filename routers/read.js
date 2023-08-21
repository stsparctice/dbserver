const express = require('express');
const router = express.Router();
const { countRowsSql,
    getDetailsMng,
    getCountDocumentsMng,
    connectTables,
    autoComplete } = require('../modules/read');
const { routerLogger } = require('../utils/logger');
const { routeEntityByItsType } = require('../utils/route_entity');
const { convertQueryToObject } = require('../utils/convert_query')

router.use(express.json());
router.use(routerLogger());

router.get('/auto_complete/:entity/:column', async (req, res) => {
    try {
        const condition = convertQueryToObject(req.query)
        const response = await routeEntityByItsType({ entityName: req.params.entity, condition }, autoComplete);
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message)
    }

});

router.get('/readOne/:entityName/:id', async (req, res) => {
    try {
        const condition = convertQueryToObject(req.query)
        const response = await routeEntityByItsType({ entityName: req.params.entityName, condition: { Id: req.params.id, ...condition }, topn: 1 }, connectTables, getDetailsMng);
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description)
        res.status(error.status).send(error.message);
    }
});

router.get('/readOne/:entityName', async (req, res) => {
    try {
        console.log(req.query)
        const condition = convertQueryToObject(req.query)
        console.log({condition})
        const response = await routeEntityByItsType({ entityName: req.params.entityName, condition, topn: 1 }, connectTables, getDetailsMng);
        console.log({response})
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message);
    }
})
router.post('/readOne/:entityName', async (req, res) => {
    try {
        console.log(req.body.condition);
        const response = await routeEntityByItsType({ entityName: req.params.entityName, condition: req.body.condition, topn: 1 }, connectTables, getDetailsMng);
        res.status(200).send(response);
    }
    catch (error) {
        console.log({ error });
        res.status(500).send(error.message);
    }
});

router.get('/readMany/:entityName', async (req, res) => {

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
        const condition = convertQueryToObject(req.query)
        let response = await routeEntityByItsType({ entityName: req.params.entityName, topn: n, condition }, connectTables, getDetailsMng);
        res.status(200).send(response)
    }
    catch (error) {
        console.log(error);
        res.status(error.status).send(error.message)
    }
});

router.post('/readMany/:entityName', async (req, res) => {
    try {
        const { condition, topn, skip } = req.body
        let response = await routeEntityByItsType({ entityName: req.params.entityName, condition, topn: topn ? topn : 100, skip: skip ? skip : 0 }, connectTables, getDetailsMng);
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message);
    }
})

router.post('/count/:entityName', async (req, res) => {
    try {
        let response = await routeEntityByItsType({ entityName: req.params.entityName, condition: req.body.condition }, countRowsSql, getCountDocumentsMng);
        res.status(200).send(response);
    }
    catch (error) {
        res.status(500).send(error.message);
    }

});

module.exports = router;
