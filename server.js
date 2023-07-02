require('dotenv').config();

const { createTables, createProcedures, createSpecialProcedures } = require('./services/sql/sql-init');
const { connectSql } = require('./services/sql/sql-connection');
const { connectMng } = require('./services/mongoDB/mongo-connection');
const { insertDataToSql } = require('./services/files/insert-data');

const http = require('http');
const { app } = require('./app');
const { HOST, PORT } = process.env;

// const {deleteSQLData, dropSQLTables} = require('./services/sql/sql-helpers');
const { deleteSQLData, dropSQLTables } = require('./services/sql/sql-helpers');
const { dropMongoDBCollection } = require('./services/mongoDB/mongoDB-helpers');

connectMng().then(_ => {
    console.log('connect to mongo')
    connectSql().then(_ => {
        createTables().then(_ => {
            createProcedures().then(_ => {
                createSpecialProcedures().then(_ => {
                    insertDataToSql();
                    app.listen(PORT, HOST, () => {
                        console.log(`http://${HOST}:${PORT}`);
                    });
                })
            });
        });
        // // deleteSQLData()
        // dropSQLTables()
        // dropMongoDBCollection()
    });
});
// });

const server = http.createServer(app)
