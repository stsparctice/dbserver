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
const {convertToSqlQuery}=require('./utils/convert_condition');
convertToSqlQuery({ AND: [{ Ovligo: 4 }, { OR: [{ City: "אשדוד" },{OR:[{jorg:"kdjf"},{AND:[{SARIT:5},{kdjj:"jdhjfa"}]}]} ,{ City:"בני-ברק" }] }], OR: [{ ZipCode: "77452" }, { ZipCode: "74522" }] ,Shores:"jdhf"})
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
                }, (err) => {
                    console.log(err.message, 'from insertDataToSql');
                })
            }, (err) => {
                console.log(err.message, 'from createSpecialProcedures');
            });
        }, (err) => {
            console.log(err.message, 'from createProcedures');
        });
        
    }, (err) => {
        console.log(err.message, 'from createTabels');
    });

}, (err) => {
    console.log(err.message, 'from connectSql');
});
// });
const server = http.createServer(app)



// deleteData();
        // dropSQLTables();
        // dropMongoDBCollection();
