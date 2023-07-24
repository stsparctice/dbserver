require('dotenv').config();
const notifictions = require('../config/serverNotifictionsConfig.json')

const { ADMIN_NAME, ADMIN_PASSWORD } = process.env;

const checkmember = obj => {
    if (!ADMIN_NAME || !ADMIN_PASSWORD) {
        throw notifictions.find(n => n.status == 509)
    }
    if (obj.password === ADMIN_PASSWORD && obj.username === ADMIN_NAME) {
        obj.role = 'admin';
    }
    return obj;
};

const checkUserRole = (role) => {
    return (req, res, next) => {
        console.log(role)
        console.log(req.session);
        // if (req.session.role === role) {
        if (role === role) {
            next();
        }
        else {
            console.log('xxxxxxxxxxx')
            res.redirect('/');
        };
    };
};

module.exports = { checkmember, checkUserRole };
