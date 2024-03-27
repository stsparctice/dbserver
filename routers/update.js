const express = require('express');
const { parseTableName, parseColumnName, parseColumnNameMiddleware } = require('../utils/parse_name');
const router = express.Router();
const { updateSql, updateOneSql, updateOne, updateMany } = require('../modules/update');
const { routerLogger } = require('../utils/logger');
const { checkDataIsUnique } = require('../utils/checkunique');
const { routeEntityByItsType } = require('../utils/route_entity');
const { readFromSql, readFromMongo } = require('../modules/read');

router.use(express.json());
router.use(routerLogger())


router.put('/updateone/:entityname', parseTableName(), parseColumnNameMiddleware(), checkDataIsUnique(), async (req, res) => {
    try {
       
        const response = await routeEntityByItsType(req.body, updateOneSql, updateOne)
        console.log({ response });
        res.status(204).end()
    } catch (error) {
        console.log({ error })
        console.log(error.description);
        res.status(500).send(error)
    }
})

router.put('/updatemany/:entityname', parseTableName(), parseColumnNameMiddleware(), checkDataIsUnique(), async (req, res) => {
    try {
        const response = await routeEntityByItsType(req.body, updateSql, updateMany);
        res.status(204).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
})

module.exports = router;
