require('dotenv')
const { create, sqlTransaction } = require('../services/sql/sql-operations');
const { insertColumn } = require('../services/sql/sql-crud-db')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');

const { newTransaction } = require('../services/sql/sql-connection')
const { SQL_DBNAME } = process.env

const { getSqlTableColumnsType, parseColumnSQLType, getPrimaryKeyField, parseSqlObjectToEntity, getConnectedEntities, getConnectionBetweenEntities, getTableFromConfig, getInnerReferencedColumns, getSQLReferencedColumns } = require('./config/config-sql');
const { getConnectionBetweenMongoAndSqlEntities } = require('./config/get-config');
const { dropDocumentMng } = require('./update');
const { createQuery } = require('../services/sql/sql-queries');
const { getTableName } = require('./config/create-config');
const { removeKeysFromObject } = require('../utils/code');

function getInsertQueryData({ tableName, sqlValues }) {
    let tabledata = getSqlTableColumnsType(tableName);
    let primarykey = getPrimaryKeyField(tableName)
    if (Object.keys(sqlValues).indexOf(primarykey) !== -1) {
        sqlValues = removeKeysFromObject(sqlValues, [primarykey])
    }
    let arr = parseColumnSQLType(sqlValues, tabledata);

    return { columns: (Object.keys(sqlValues).join()).trim(), values: arr.join() }
}

//this is one level transaction

function buildInsertQueriesForTransaction(data) {
    const { sqlEntityName, sqlValues, connectedEntities } = data;
    const connectedEntities1 = getConnectionBetweenEntities(sqlEntityName)
    let { columns, values } = getInsertQueryData({ tableName: sqlEntityName, sqlValues })
    const insertQuery = createQuery(sqlEntityName, columns, values)
    let queryList = []
    if (connectedEntities) {
        for (let connectedEntity in connectedEntities) {
            let connecteTable = getTableFromConfig(connectedEntity)
            let connectedTableName = connecteTable.MTDTable.name.sqlName
            let connectionColumns = connectedEntities1.find(({ tableName }) => tableName === connectedTableName)
            console.log({ connectionColumns })
            console.log(connectedEntities[connectedEntity])
            if (Array.isArray(connectedEntities[connectedEntity])) {
                queryList = connectedEntities[connectedEntity].map(item => {
                    const removeEmptyKeys = Object.keys(item.sqlValues).filter(key => item.sqlValues[key] === undefined || item.sqlValues[key] === null)
                    item.sqlValues = removeKeysFromObject(item.sqlValues, removeEmptyKeys)
                    console.log(item.sqlValues)
                    let { columns, values } = getInsertQueryData({ tableName: item.sqlEntityName, sqlValues: item.sqlValues })
                    columns = columns + `,${connectionColumns.column[0].sqlName}`
                    values = values + `, <result>`
                    return createQuery(item.sqlEntityName, columns, values)


                })
                console.log(queryList);
            }
        }
    }
    return { mainquery: insertQuery, connectedQueries: queryList }
}

async function insertOneSql(obj) {

    try {
        if (obj.tableName === undefined) {
            obj.tableName = obj.sqlEntityName
        }

        const { connectedEntities } = obj
        const referenceColumns = getSQLReferencedColumns(obj.tableName)
        referenceColumns.forEach(({sqlName, ref})=>{
            if(typeof(obj.sqlValues[sqlName])==='object'){
                const value = obj.sqlValues[sqlName]
                obj.sqlValues[sqlName] = value[ref.name]
            }
        })
        if (connectedEntities) {
            const queries = buildInsertQueriesForTransaction(obj)
            const response = await sqlTransaction(queries)
            console.log({ response })
            return response.recordset[0]
        }
        else {
            const { columns, values } = getInsertQueryData({ tableName: obj.tableName, sqlValues: obj.sqlValues })
            const query = createQuery(obj.tableName, columns, values)
            const result = await create(query);
            return result[0];
        }
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
            let query = createQuery(obj.entityName, (Object.keys(item).join()).trim(), arr.join())
            let res = await create(query);
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
    console.log('transaction');
    console.log(obj);
    let mongoId = undefined
    try {
        const { sqlReferences } = getConnectionBetweenMongoAndSqlEntities({ mongoEntity: obj.mongoEntityName, sqlEntity: obj.sqlEntityName })
        console.log({sqlReferences});
        if (sqlReferences.length > 0) {
            const mongo = await insertOne({ entityName: obj.mongoEntityName, data: obj.mongoValues })
            mongoId = mongo._id
            sqlReferences.forEach(({ reference, sqlName }) => {
                obj.sqlValues[sqlName] = mongo[reference.field]
            })

        }
        console.log(obj.sqlEntityName)
        const result = await insertOneSql(obj)
        
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

// const transactionCreate = async (data) => {
//     const { statement, transaction } = await newTransaction()
//     let result = []
//     let insertIds = []


//     try {
//         await transaction.begin()

//         // sqlRecords = data.map(record => {
//         //     let dbObject = parseDBname(record.entityName)
//         //     record.entityName = dbObject.entityName
//         //     record.type = dbObject.type
//         //     return record
//         // }).filter(({ type }) => type === DBType.SQL).map(({ type, ...rest }) => rest);
//         // mongoRecords = data.filter(({ type }) => type === DBType.MONGO).map(({ type, ...rest }) => rest)

//         // for (let record of mongoRecords) {
//         //     const ans = await insertMany({ entityName: record.entityName, data: record.values });
//         //     insertIds = [...insertIds, ...Object.values(ans).map(Id => { return { entityName: record.entityName, Id } })];
//         // }


//         // record.values = record.values.map(obj => parseColumnName(obj, record.entityName))
//         // let reference = getForeginKeyColumns(record.entityName);
//         // console.log({ reference });
//         // if (reference.length > 0) {
//         //     let ref = result.map((res) => { return { ...res, column: reference.find((ref) => ref.tableName === res.tableName) } }).filter(({ column }) => column&&column.type.toLowerCase())
//         //     ref = ref.reduce((state, r) => {
//         //         if (!state.some((s) => s.tableName === r.tableName)) {
//         //             state = [...state, { tableName: r.tableName, primaryKey: r.primaryKey, column: r.column.column }];
//         //         }
//         //         return state;
//         //     }, [])
//         //     ref.forEach(r => {
//         //         record.values.forEach(v => {
//         //             if (v[r.column] === null)
//         //                 v[r.column] = r.primaryKey;
//         //         })
//         //     })
//         // }

//         // const connectedEntities = getConnectionBetweenEntities(data.tableName)
//         // console.log(connectedEntities)
//         // console.log(connectedEntities[0].column)
//         // console.log(data)

//         const { sqlEntityName, sqlValues } = data;
//         let { columns, values } = getInsertQueryData({ tableName: sqlEntityName, sqlValues })
//         const insertQuery = createQuery(sqlEntityName, columns, values)

//         let moreEntities = [];
//         for (let record of values) {
//             for (let key in record) {
//                 if (record[key] instanceof Array) {
//                     moreEntities = [...moreEntities, { entityName: key, values: record[key] }]
//                     delete record[key]
//                 }
//                 else {
//                     if (typeof key === 'object') {
//                         const result = await transactionCreate(record[key])
//                         if (result) {
//                             record[key] = result.Id;
//                         }
//                     }
//                 }

//             }
//             let arr = parseColumnSQLType(record, tabledata)
//             try {
//                 console.log(`USE ${SQL_DBNAME} INSERT INTO ${record.entityName} (${Object.keys(iterator).join()}) VALUES(${arr.join()}) SELECT @@IDENTITY ${primarykey}`);
//                 await statement.prepare(`USE ${SQL_DBNAME} INSERT INTO ${record.entityName} (${Object.keys(iterator).join()}) VALUES(${arr.join()}) SELECT @@IDENTITY ${primarykey}`)
//                 const ans = await statement.execute();
//                 result = [...result, { tableName: record.entityName, primaryKey: ans.recordset[0].Id }]
//             }
//             finally {
//                 await statement.unprepare();

//             }


//             await transaction.commit();
//             result = [...result, ...insertIds]
//             return result
//         }
//     }
//     catch (error) {
//         await transaction.rollback();
//         for (let id of insertIds) {
//             await dropDocumentMng({ filter: id.id, collection: id.entityName })
//         }
//         result = []
//         console.log({ error });
//         throw error
//     }

// }

module.exports = { insertOneSql, insertManySql, insertOne, creatNewColumn, insertMany, transactionSqlMongo };
