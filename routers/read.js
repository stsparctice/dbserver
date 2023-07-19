const express = require('express');
const router = express.Router();
const { countRowsSql, getDetailsMng, getCountDocumentsMng,
    connectTables, autoComplete } = require('../modules/read');
const { routerLogger } = require('../utils/logger');
const { routeEntityByItsType } = require('../utils/route_entity');
const { conversionQueryToObject } = require('../utils/convert_condition')

router.use(express.json());
router.use(routerLogger());

router.get('/auto_complete/:entity/:column', conversionQueryToObject(), async (req, res) => {
    try {
        console.log({ like: req.query.LIKE });
        const result = await autoComplete({ ...req.params, condition: req.query });
        res.status(200).send(result);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message)
    }

});

router.get('/readOne/:entityName/:id', conversionQueryToObject(), async (req, res) => {
    try {
        const response = await routeEntityByItsType({ entityName: req.params.entityName, condition: { Id: req.params.id }, topn: 1 }, connectTables, getDetailsMng);
        res.status(200).send(response);
    }
    catch (error) {
        console.log(error.description)
        res.status(error.status).send(error.message);
    }
});

router.get('/readOne/:entityName', conversionQueryToObject(), async (req, res) => {
    try {
        const response = await routeEntityByItsType({ entityName: req.params.entityName, condition: req.query, topn: 1 }, connectTables, getDetailsMng);
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

router.get('/readMany/:entityName', conversionQueryToObject(), async (req, res) => {
    try {
        let n = 50
        if (req.query.n) {
            n = req.query.n
            delete req.query.n
        }

        let response = await routeEntityByItsType({ entityName: req.params.entityName, topn: n, condition: req.query }, connectTables, getDetailsMng);
        res.status(200).send(response)
    }
    catch (error) {
        console.log(error.description);
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
