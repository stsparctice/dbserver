require('dotenv')
const { create } = require('../services/sql/sql-operations');
const { insertColumn } = require('../services/sql/sql-crud-db')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');

const { newTransaction } = require('../services/sql/sql-connection')
const { SQL_DBNAME } = process.env


const { getSqlTableColumnsType, parseColumnSQLType, getPrimaryKeyField, parseSqlObjectToEntity } = require('./config/config-sql');
const { getConnectionBetweenMongoAndSqlEntities } = require('./config/get-config');
const { readFromMongo } = require('./read');
const { dropDocumentMng } = require('./update');

async function insertOneSql(obj) {
    try {
        let tabledata = getSqlTableColumnsType(obj.entityName);
        const filterProps = Object.entries(obj.sqlValues)
        const insertValues = Object.fromEntries(filterProps)
        let arr = parseColumnSQLType(insertValues, tabledata);
        const result = await create({ tableName:obj.tableName, columns: (Object.keys(insertValues).join()).trim(), values: arr.join() });
        return result[0];
    }
    catch (error) {
        console.log(error)
        throw error;
    }
};


async function insertManySql(obj) {
    try {
        let tabledata
        let arr
        let values = obj.values

        let result = []
        tabledata = getSqlTableColumnsType(obj.entityName)
        for (let item of values) {
            arr = parseColumnSQLType(item, tabledata);
            let res = await create({ tableName: obj.entityName, columns: (Object.keys(item).join()).trim(), values: arr.join() });
            result = [...result, ...res]
        }
        if (result) {
            return result;
        }
        else
            return false;
    }
    catch (error) {
        throw error;
    }
}
async function creatNewColumn(obj) {
    const result = await insertColumn(obj)
}

// async function creatSqlTable(obj) {
//     const result = await createNewTable(obj)
//     return result
// }

async function insertOne({ entityName, data }) {
    try {
        const mongo = new MongoDBOperations(entityName)
        const response = await mongo.insertOne(data);
        return response;
    }
    catch (error) {
        console.log(error)
        throw error
    }
};
async function insertMany(obj) {
    try {
        const mongo = new MongoDBOperations(entityName)
        const result = await mongo.insertMany(obj.data);
        return result;
    }
    catch (error) {
        console.log(error)
        throw error;
    }
}

async function transactionSqlMongo(obj) {
    let mongoId = undefined
    try {
        const { sqlReferences } = getConnectionBetweenMongoAndSqlEntities({ mongoEntity: obj.mongoEntityName, sqlEntity: obj.sqlEntityName })
        if (sqlReferences.length > 0) {
            const mongo = await insertOne({ entityName: obj.mongoEntityName, data: obj.mongoValues })
            mongoId = mongo._id
            sqlReferences.forEach(({ reference, sqlName }) => {
                obj.sqlValues[sqlName] = mongo[reference.field]
            })

        }
        console.log(obj.sqlEntityName)
        const result = await insertOneSql({ entityName: obj.sqlEntityName, values: obj.sqlValues })
        return result
    }
    catch (error) {
        console.log({ error })
        if (mongoId) {
            const dropData = await dropDocumentMng({ collection: obj.mongoEntityName, filter: { _id: mongoId } })
        }

        throw error
    }
}

const transactionCreate = async (data) => {
    const { statement, transaction } = await newTransaction()
    let result = []
    let insertIds = []
    try {
        await transaction.begin()

        // sqlRecords = data.map(record => {
        //     let dbObject = parseDBname(record.entityName)
        //     record.entityName = dbObject.entityName
        //     record.type = dbObject.type
        //     return record
        // }).filter(({ type }) => type === DBType.SQL).map(({ type, ...rest }) => rest);
        // mongoRecords = data.filter(({ type }) => type === DBType.MONGO).map(({ type, ...rest }) => rest)

        // for (let record of mongoRecords) {
        //     const ans = await insertMany({ entityName: record.entityName, data: record.values });
        //     insertIds = [...insertIds, ...Object.values(ans).map(Id => { return { entityName: record.entityName, Id } })];
        // }


        // record.values = record.values.map(obj => parseColumnName(obj, record.entityName))
        // let reference = getForeginKeyColumns(record.entityName);
        // console.log({ reference });
        // if (reference.length > 0) {
        //     let ref = result.map((res) => { return { ...res, column: reference.find((ref) => ref.tableName === res.tableName) } }).filter(({ column }) => column&&column.type.toLowerCase())
        //     ref = ref.reduce((state, r) => {
        //         if (!state.some((s) => s.tableName === r.tableName)) {
        //             state = [...state, { tableName: r.tableName, primaryKey: r.primaryKey, column: r.column.column }];
        //         }
        //         return state;
        //     }, [])
        //     ref.forEach(r => {
        //         record.values.forEach(v => {
        //             if (v[r.column] === null)
        //                 v[r.column] = r.primaryKey;
        //         })
        //     })
        // }
        const { values } = data;
        let tabledata = getSqlTableColumnsType(data.entityName)
        let primarykey = getPrimaryKeyField(data.entityName)
        let moreEntities = [];
        for (let record of values) {
            for (let key in record) {
                if (record[key] instanceof Array) {
                    moreEntities = [...moreEntities, { entityName: key, values: record[key] }]
                    delete record[key]
                }
                else {
                    if (typeof key === 'object') {
                        const result = await transactionCreate(record[key])
                        if (result) {
                            record[key] = result.Id;
                        }
                    }
                }

            }
            // אני פה בדיוק באמצע של האמצע של האמצע ואני חיייייבת ללכת על כן על המורה להמשיך את זה לטפל בהכנסה של כל מה שמחקתי באובייקט הראשי
            let arr = parseColumnSQLType(record, tabledata)
            try {
                console.log(`USE ${SQL_DBNAME} INSERT INTO ${record.entityName} (${Object.keys(iterator).join()}) VALUES(${arr.join()}) SELECT @@IDENTITY ${primarykey}`);
                await statement.prepare(`USE ${SQL_DBNAME} INSERT INTO ${record.entityName} (${Object.keys(iterator).join()}) VALUES(${arr.join()}) SELECT @@IDENTITY ${primarykey}`)
                const ans = await statement.execute();
                result = [...result, { tableName: record.entityName, primaryKey: ans.recordset[0].Id }]
            }
            finally {
                await statement.unprepare();

            }


            await transaction.commit();
            result = [...result, ...insertIds]
            return result
        }
    }
    catch (error) {
        await transaction.rollback();
        for (let id of insertIds) {
            await dropDocumentMng({ filter: id.id, collection: id.entityName })
        }
        result = []
        console.log({ error });
        throw error
    }

}

module.exports = { insertOneSql, insertManySql, insertOne, creatNewColumn, insertMany, transactionCreate, transactionSqlMongo };
