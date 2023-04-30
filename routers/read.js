const express = require('express');
const router = express.Router();
const { getDetailsMod } = require('../modules/read');

router.use(express.json());

router.post('/readTop20', async (req, res) => {
   const table = await getDetailsMod(req.body);
   res.status(200).send(table);
});

module.exports = router;
