const express = require('express');
const router = express.Router();
const { updateMod, createMod } = require('../modules/update');

router.use(express.json());

router.post('/update', async (req, res) => {
    const result = await updateMod(req.body);
    res.status(200).send(result);
});

router.post('/create', async (req, res) => {
    const result = await createMod(req.body);
    res.status(200).send(result);
});

router.post('/delete', async (req, res) => {
    const result = await updateMod(req.body);
    res.status(200).send(result);
});


module.exports = router;
