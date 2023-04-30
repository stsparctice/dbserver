const express = require('express');
const router = express.Router();
const { createMod } = require('../modules/create');

router.use(express.json());

router.post('/create', async (req, res) => {
    const result = await createMod(req.body);
    res.status(200).send(result);
});

module.exports = router;
