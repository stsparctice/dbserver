require('dotenv').config();

const { createTables } = require('./services/sql/sql-init')
const { connect } = require('./services/sql/sql-connection')
const http = require('http');
const { app } = require('./app');
const { HOST, PORT } = process.env;

connect().then(_ => {
    createTables().then(_ => {
        app.listen(PORT, HOST, () => {
            console.log(`http://${HOST}:${PORT}`);
        });
    });
});

const server = http.createServer(app);
