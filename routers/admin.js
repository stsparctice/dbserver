const express = require('express');
const router = express.Router();
const config = require('../config/DBconfig.json');
const { checkUserRole } = require('../modules/authorization');
const { updateConfig } = require('../modules/admin');
const { routerLogger } = require('../utils/logger');
const {delTableConfig} =require('../modules/admin/delete')
const {createTableInConfig} = require('../modules/admin/create');

router.use(routerLogger())

router.use(checkUserRole('admin'));

router.get('/', async (req, res) => {
    res.render('admin', { config });
});

router.post('/updateConfig', express.urlencoded({ extended: true }), async (req, res) => {
    _ = await updateConfig(req.body);
    res.redirect('/');
});
//מחיקת טבלה
router.post('/delTable',express.json(), async (req, res)=> {
    try {
        const result = await delTableConfig(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        console.log(error.message);
        res.send(error.message)
    }
});
//עדכון טבלה עי יצירת חדשה
router.post('/createTableInConfig', express.json(), async (req, res) => {
    if((req.body.columns).includes(undefined)){
    }        
    console.log('im in router');

    _ = await createTableInConfig(req.body);
    res.status(200).send(true);
});

module.exports = router;
