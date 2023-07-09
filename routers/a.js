const express = require('express');
const router = express.Router();
// const config = require('../config.json')
// const { updateConfigCreate } = require('../modules/admin');
const { updateConfig2 } = require('../modules/admin');

router.use(express.json());


router.post('/updateConfig2', express.json(), async (req, res) => {
        if((req.body.columns).includes(undefined)){
            console.log('include');
        }
        _ = await updateConfig2(req.body);
        res.status(200).send(true);
    });

module.exports = router
