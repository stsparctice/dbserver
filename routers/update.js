const express = require('express');
const { parseTableName, parseColumnName, parseColumnNameMiddleware } = require('../utils/parse_name');
const router = express.Router();
const { updateSql, updateOneSql, updateQuotationSql, updateSuppliersBranchesSql, updateOne, dropCollectionMng, dropDocumentMng, updateMany } = require('../modules/update');
const { routerLogger } = require('../utils/logger');
const { ObjectId } = require('mongodb');
const { checkDataIsUnique } = require('../utils/checkunique');
const { routeEntityByItsType } = require('../utils/route_entity');

router.use(express.json());
router.use(routerLogger())

// router.post('/update', parseTableName(), parseColumnName(), checkDataIsUnique(), async (req, res) => {
//     try {
//         const result = await updateSql(req.body);
//         res.status(204).send(result);
//     }
//     catch (error) {
//         res.status(error.status).send(error.message)
//     }
// });

// router.post('/updateOne', async (req, res) => {
//     const result = await updateOneSql(req.body);
//     res.status(error.status).send(result);
// });

// router.post('/updateQuotation', parseTableName(), parseColumnName(), async (req, res) => {
//     try {
//         const result = await updateQuotationSql(req.body);
//         res.status(200).send(result);
//     }
//     catch (error) {
//         res.status(error.status).send(error.message)
//     }
// });


// router.post('/updateSuppliersBranches', parseTableName(), parseColumnName(), async (req, res) => {
//     try {
//         const result = await updateSuppliersBranchesSql(req.body);
//         res.status(200).send(result);
//     }
//     catch (error) {
//         res.status(error.status).send(error.message)
//     }
// });

// router.post('/mongo', async (req, res) => {
//     try {
//         const result = await updateMng(req.body);
//         res.status(200).send(result);
//     }
//     catch (error) {
//         res.status(error.status).send(error.message)
//     }
// });

// router.post('/dropCollection', async (req, res) => {
//     try {
//         const result = await dropCollectionMng(req.body);
//         res.status(200).send(result);
//     }
//     catch (error) {
//         res.status(error.status).send(error.message)
//     }
// });

// router.post('/dropDocumentById', async (req, res) => {
//     try {
//         const { collection, data } = req.body
//         data['_id'] = ObjectId(data['_id'])
//         const result = await dropDocumentMng({ collection, data });
//         if (result) {
//             res.status(204).send('resourse deleted successfully');
//         }
//         else {
//             res.status(500).send('cannot delete resource')
//         }
//     }
//     catch (error) {
//         res.status(error.status).send(error.message)
//     }
// });

// router.post('/dropDocument', async (req, res) => {
//     // console.log("req.body",req.body);
//     try {
//         const result = await dropDocumentMng(req.body);
//         res.status(204).send('resourse deleted successfully');

//     } catch (error) {
//         res.status(error.status).send(error.message)
//     }
// })


router.put('/updateone', parseTableName(), parseColumnNameMiddleware(), checkDataIsUnique(), async (req, res) => {
    try {
        const response = await routeEntityByItsType(req.body, updateSql, updateOne)
        res.status(204).send(response)
    } catch (error) {
        res.status(error.status).send(error.message)
    }
})

router.put('/updatemany', parseTableName(), parseColumnNameMiddleware(), checkDataIsUnique(), async (req, res) => {
    try {
        const response = await routeEntityByItsType(req.body, updateSql, updateMany);
        res.status(204).send(response);
    } 
    catch (error) {
        res.status(error.status).send(error.message);
    }
})

module.exports = router;
