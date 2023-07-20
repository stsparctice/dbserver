const express = require('express');
const router = express.Router();
const { countRowsSql, getDetailsMng, getCountDocumentsMng,
    connectTables, autoComplete } = require('../modules/read');
const { routerLogger } = require('../utils/logger');
const { routeEntityByItsType } = require('../utils/route_entity');
const { convertQueryToObject } = require('../utils/convert_condition')

router.use(express.json());
router.use(routerLogger());

router.get('/auto_complete/:entity/:column', async (req, res) => {
    try {
        console.log({ like: req.query.LIKE });
        const condition = convertQueryToObject(req.query)
        const result = await autoComplete({ ...req.params, condition });
        res.status(200).send(result);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message)
    }

});

router.get('/readOne/:entityName/:id',  async (req, res) => {
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

router.get('/readOne/:entityName',  async (req, res) => {
    try {
        const condition = convertQueryToObject(req.query)
        const response = await routeEntityByItsType({ entityName: req.params.entityName, condition, topn: 1 }, connectTables, getDetailsMng);
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message);
    }
})
router.post('/readOne/:entityName', async (req, res) => {
    try {
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
        if (req.query.n) {
            n = req.query.n
            req.query = [req.query].map(({ n, ...rest }) => rest)[0]
        }
        const condition = convertQueryToObject(req.query)
        console.log({condition})
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
        let response = await routeEntityByItsType({ entityName: req.params.entityName, condition: req.body.condition, topn: req.body.topn ? req.body.topn : 100 }, connectTables, getDetailsMng);
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
