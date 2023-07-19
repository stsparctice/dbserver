const { routeEntityByItsType } = require('../utils/route_entity')

const express = require('express')
const { updateOne, updateSql, updateMany } = require('../modules/update');
const { parseColumnNameMiddleware, parseTableName } = require('../utils/parse_name');
const router = express.Router();
router.use(express.json());

router.delete('/deleteone', parseTableName(), parseColumnNameMiddleware(), async (req, res) => {
    try {
        console.log('delete', new Date().toISOString())
        let response = await routeEntityByItsType(req.body, updateSql, updateOne);
        console.log({response})
        res.status(204).send();
    }
    catch (error) {
        res.status(error.status).send(error.message);
    }
});

router.delete('/deletemany', parseTableName(), parseColumnNameMiddleware(), async (req, res) => {
    try {
        let response = await routeEntityByItsType(req.body, updateSql, updateMany);
        res.status(204).send(response);
    }
    catch (error) {
        res.status(error.status).send(error.message);
    }
})

module.exports = router;
