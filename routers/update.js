const express = require('express');
const { parseTableName, parseColumnName, parseColumnNameMiddleware } = require('../utils/parse_name');
const router = express.Router();
const { updateSql, updateOneSql, updateOne, updateMany } = require('../modules/update');
const { routerLogger } = require('../utils/logger');
const { checkDataIsUnique } = require('../utils/checkunique');
const { routeEntityByItsType } = require('../utils/route_entity');

router.use(express.json());
router.use(routerLogger())


router.put('/updateone', parseTableName(), parseColumnNameMiddleware(), checkDataIsUnique(), async (req, res) => {
    try {
        const response = await routeEntityByItsType(req.body, updateOneSql, updateOne)
        res.status(204).send(response)
    } catch (error) {
        console.log({ error })
        console.log(error.description);
        res.status(error.status).send(error)
    }
})

router.put('/updatemany', parseTableName(), parseColumnNameMiddleware(), checkDataIsUnique(), async (req, res) => {
    try {
        const response = await routeEntityByItsType(req.body, updateSql, updateMany);
        res.status(204).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message);
    }
})

module.exports = router;
