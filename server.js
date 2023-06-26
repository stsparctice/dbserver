require('dotenv').config();

const { createTables, createProcedures, createSpecialProcedures } = require('./services/sql/sql-init');
const { connectSql } = require('./services/sql/sql-connection');
const { connectMng } = require('./services/mongoDB/mongo-connection');
const { insertDataToSql } = require('./services/files/insert-data');

const http = require('http');
const { app } = require('./app');
const { HOST, PORT } = process.env;

<<<<<<< HEAD
const {deleteSQLData, dropSQLTables} = require('./services/sql/sql-helpers');
=======
const { deleteSQLData, dropSQLTables } = require('./services/sql/sql-helpers');
>>>>>>> 0c4d3f37ac5f8c3431b9fd164581ac1183c1ec5f
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
<<<<<<< HEAD
        // // deleteSQLData()
        // dropSQLTables()
        // dropMongoDBCollection()

=======
        // deleteData();
        // dropSQLTables();
        // dropMongoDBCollection();
>>>>>>> 0c4d3f37ac5f8c3431b9fd164581ac1183c1ec5f
    });
});

const server = http.createServer(app);
