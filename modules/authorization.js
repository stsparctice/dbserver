require('dotenv').config();

const { ADMIN_NAME, ADMIN_PASSWORD } = process.env;

const checkmember = obj => {
    if (!ADMIN_NAME || !ADMIN_PASSWORD) {
        throw new Error('.env file is not valid or is not exsist.')
    }
    if (obj.password === ADMIN_PASSWORD && obj.username === ADMIN_NAME) {
        obj.role = 'admin';
    }
    return obj;
};

const checkUserRole = (role) => {
    return (req, res, next) => {
        if (req.session.role === role) {
            next();
        }
        else {
            res.redirect('/');
        };
    };
};

module.exports = { checkmember, checkUserRole };
