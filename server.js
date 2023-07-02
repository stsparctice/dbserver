require('dotenv').config();

const { createTables, createProcedures, createSpecialProcedures } = require('./services/sql/sql-init');
const { connectSql } = require('./services/sql/sql-connection');
const { connectMng } = require('./services/mongoDB/mongo-connection');
const { insertDataToSql } = require('./services/files/insert-data');

const http = require('http');
const { app } = require('./app');
const { HOST, PORT } = process.env;

const { deleteSQLData, dropSQLTables } = require('./services/sql/sql-helpers');
const { dropMongoDBCollection } = require('./services/mongoDB/mongoDB-helpers');

try {
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

            // deleteData();
            // dropSQLTables();
            // dropMongoDBCollection();
        });
    });
}
catch (error) {
    console.log(error.message)
    console.log('error.message')
}
// });

const server = http.createServer(app);
