const express = require('express');
const router = express.Router();
const { createSql,insertManySql, createMng, creatSqlTable} = require('../modules/create');
const { routerLogger } = require('../utils/logger');

const {updateConfig,updateConfigInFiled,updateConfig2}=require('../modules/admin')

router.use(express.json());
router.use(routerLogger())

router.post('/create', async (req, res) => {
    const result = await createSql(req.body);
    if(result)
    res.status(201).send(result);
    else
    res.status(500).send(false)
});

router.post('/createManySql', async (req, res) => {
    const result = await insertManySql(req.body);
    res.status(200).send(result);
});


router.post('/insertone', async (req, res) => {
    const result = await createMng(req.body);
    res.status(200).send(result);
});

router.post('/insertColumn',async(req,res)=>{
    // _ = await updateConfigInFiled(req.body);
    const result=await insertColumn
    res.status(200).send({result})
})

router.post('/insertTable',async(req,res) =>{
    _ = await updateConfig2(req.body);
    const result = await creatSqlTable(req.body);
    res.status(200).send({result})
})

module.exports = router
