require('dotenv').config();

const { createTables, createProcedures, createSpecialProcedures } = require('./services/sql/sql-init')
const { connectSql } = require('./services/sql/sql-connection')
const { connectMng } = require('./services/mongoDB/mongo-connection')
const {insertDataToSql} = require('./services/files/insert-data')

const http = require('http');
const { app } = require('./app');
const { HOST, PORT } = process.env;

const {deleteSQLData, dropSQLTables} = require('./services/sql/sql-helpers')

<<<<<<< HEAD
// connectMng().then(_ => {
=======


// connectMng().then(_ => {
    // console.log("connect to mongo");
>>>>>>> b176d448b8d3cdb2f383742907a0b8039ec8c416
    connectSql().then(_ => {
        createTables().then(_ => {
            createProcedures().then(_ => {
                createSpecialProcedures().then(_ => {
                    insertDataToSql()
                    app.listen(PORT, HOST, () => {
                        console.log(`http://${HOST}:${PORT}`);
                    });
                })
            });
        });
        // deleteSQLData()
        // dropSQLTables()

    });
// });

const server = http.createServer(app);
