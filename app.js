const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');

const admin_router = require('./routers/admin');
const login_router = require('./routers/login');
const create_router = require('./routers/create');
const read_router = require('./routers/read');
const update_router = require('./routers/update');
const config_router= require('./routers/config');
const a= require('./routers/a');
app.set('view engine', 'ejs');


app.use(cors());
app.use(session({
    secret: 'any',
    saveUninitialized: false,
    resave: true
}));
app.use('/admin', admin_router);
app.use('/login', login_router);
app.use('/create', create_router);
app.use('/read', read_router);
app.use('/update', update_router);
app.use('/config', config_router);
app.use('/a', a);


app.get('/', (req, res) => {
    res.render('login');
});

app.get('/*', (req, res) => {
    res.status(200).send('request not found');
});

module.exports = { app };
