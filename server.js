require('dotenv').config();

const { createTables, createProcedures, createSpecialProcedures } = require('./services/sql/sql-init')
const { connectSql } = require('./services/sql/sql-connection')
const { connectMng } = require('./services/mongoDB/mongo-connection')
const http = require('http');
const { app } = require('./app');
const { HOST, PORT } = process.env;

connectMng().then(_ => {
    connectSql().then(_ => {
        createTables().then(_ => {
            // createProcedures().then(_ => {
                // createSpecialProcedures().then(_ => {
                    app.listen(PORT, HOST, () => {
                        console.log(`http://${HOST}:${PORT}`);
                    });
                // })
            // });
        });
    });
});

const server = http.createServer(app);
