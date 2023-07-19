const express = require('express');
const router = express.Router();
const {delTableConfig} =require('../modules/delete')

router.use(express.json());

router.post('/delTable', async (req, res)=> {
    // console.log("in router");
    // console.log(req.body," req");
    try {
        const result = await delTableConfig(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        // console.log("errrrroooooooorrrrrrrrrrr");
        res.send(error.message)
    }
});

module.exports=router



