const { routeEntityByItsType } = require('../utils/route_entity')

const express = require('express')
const { updateOne, updateSql, updateMany, updateOneSql } = require('../modules/update');
const { parseColumnNameMiddleware, parseTableName } = require('../utils/parse_name');
const { deleteSql } = require('../modules/delete');
const { routerLogger } = require('../utils/logger');

const router = express.Router();

router.use(express.json());
router.use(routerLogger())

router.delete('/deleteone/:entityname', parseTableName(), parseColumnNameMiddleware(), async (req, res) => {
    try {
        let response = await routeEntityByItsType({ data: req.body, sql: deleteSql, mongo: updateOne });
        console.log({ response })
        res.status(204).send();
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
});

router.delete('/deletemany/:entityname', parseTableName(), parseColumnNameMiddleware(), async (req, res) => {
    try {
        let response = await routeEntityByItsType({ data: req.body, sql: updateSql, mongo: updateMany });
        res.status(204).send(response);
    }
    catch (error) {
        console.log(error.description);
        res.status(500).send(error.message);
    }
})

module.exports = router;
