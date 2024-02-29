const { routeEntityByItsType } = require('../utils/route_entity')

const express = require('express')
const { updateOne, updateSql, updateMany, updateOneSql } = require('../modules/update');
const { parseColumnNameMiddleware, parseTableName } = require('../utils/parse_name');
const { deleteSql } = require('../modules/delete');
const { routerLogger } = require('../utils/logger');
const router = express.Router();
router.use(express.json());
router.use(routerLogger())
router.delete('/deleteone', parseTableName(), parseColumnNameMiddleware(), async (req, res) => {
    try {
        let response = await routeEntityByItsType(req.body, deleteSql, updateOne);
        console.log({response})
        res.status(204).send();
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message);
    }
});

router.delete('/deletemany', parseTableName(), parseColumnNameMiddleware(), async (req, res) => {
    try {
        let response = await routeEntityByItsType(req.body, updateSql, updateMany);
        res.status(204).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(error.status).send(error.message);
    }
})

module.exports = router;
