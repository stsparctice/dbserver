const express = require('express');
const router = express.Router();
const { createSql, insertManySql, insertOne, insertMany, transactionCreate } = require('../modules/create');
const { routerLogger } = require('../utils/logger');

// const { updateConfig, updateConfigInFiled, updateConfig2 } = require('../modules/admin')
const { parseColumnName, parseTableName, parseColumnNameMiddleware, parseListOfColumnsName } = require('../utils/parse_name');
const { routeEntityByItsType } = require('../utils/route_entity');
const { checkDataIsUnique } = require('../utils/checkunique');

router.use(express.json());
router.use(routerLogger())

router.post('/createone', parseTableName(), parseColumnNameMiddleware(), checkDataIsUnique(), async (req, res) => {
    try {
        console.log(req.body, ' req.body')
        const response = await routeEntityByItsType(req.body, createSql, insertOne);
        res.status(201).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
});

router.post('/createmany', parseTableName(), parseListOfColumnsName(), checkDataIsUnique(), async (req, res) => {
    try {

        const response = await routeEntityByItsType(req.body, insertManySql, insertMany);
        res.status(201).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message);
    }
});

router.post('/createManyEntities', async (req, res) => {
    try {

    
        // const obj = [
        //     {
        //         entityName: 'Orderers', values: [
        //             { ordererName: 'עדי ברוינר', ordererPhone: '025669664', addedDate: new Date().toISOString(), disable: 'False' }
        //         ]
        //     },
        //     {
        //         entityName: "Leads", values: [
        //             {  SupplyDate: new Date(2023, 6, 24).toISOString(), 
        //                OrdererCode:  { ordererName: 'עדי ברוינר', ordererPhone: '025669664', addedDate: new Date().toISOString(), disable: 'False' }, 
        //                AddedDate: new Date(2023, 6, 24).toISOString(),
        //                Disable: 'False',
        //                MoreProductsItems : [
        //                               { product: 1, addedDate: new Date().toISOString() }
        //                ] },
        //             ]
        //     }, {
        //         entityName: 'unitOfMeasure', values: [
        //             { measure: 'meter', disable: 'True' }
        //         ]
        //     }
        //     , {
        //         entityName: 'additions', values: [
        //             { name: 'pipe', addedDate: new Date().toISOString(), enabled: 'True' }
        //         ]
        //     }
        //     , {
        //         entityName: 'areas', values: [
        //             { a: '1' },
        //             { b: '2' }
        //         ]
        //     },
        //     {
        //         entityName: 'products', values: [{ a: 1, b: 2 }]
        //     }, {
        //         entityName: 'moreProductsItems',
        //         values: [
        //             { product: 1, addedDate: new Date().toISOString() }
        //         ]
        //     }]
        let response = await transactionCreate(req.body)
        res.status(201).send(response)
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message)
    }
})


module.exports = router;
