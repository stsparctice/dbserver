require('dotenv')
const { create, insertColumn } = require('../services/sql/sql-operations');
// const { checkObjCreate } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;
const { newTransaction } = require('../services/sql/sql-connection')
const { parseDBname, parseColumnName } = require('../utils/parse_name')
const { DBType } = require('./config/get-config')
const { getPrimaryKeyField, getForeignTableAndColumn, getForeginKeyColumns } = require('./config/config-sql')
const { SQL_DBNAME } = process.env


const { getSqlTableColumnsType, parseSQLType } = require('./config/config-sql');

async function createSql(obj) {
    try {
        let tabledata = getSqlTableColumnsType(obj.entityName);
        let arr = parseSQLType(obj.values, tabledata);
        const result = await create({ tableName: obj.entityName, columns: (Object.keys(obj.values).join()).trim(), values: arr.join() });
        return result;
    }
    catch (error) {
        console.log("error")
        throw error;
    }
};


async function insertManySql(obj) {
    try {
        let tabledata
        let arr
        let values = obj.values

        let result = []
        for (let o of values) {
            tabledata = getSqlTableColumnsType(obj.entityName)
            arr = parseSQLType(o, tabledata);
            let res = await create({ tableName: obj.entityName, columns: (Object.keys(o).join()).trim(), values: arr.join() });
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

async function insertOne(obj) {
    try {
        mongoCollection.setCollection(obj.entityName);
        const response = await mongoCollection.insertOne(obj.data);
        return response;
    }
    catch (error) {
        console.log("error")
        throw error
    }
};
async function insertMany(obj) {
    try {
        mongoCollection.setCollection(obj.entityName);
        const result = await mongoCollection.insertMany(obj.data);
        return result;
    }
    catch (error) {
        console.log("error")
        throw error;
    }
}

const transactionCreate = async (data) => {
    const { statement, transaction } = await newTransaction()
    let result = []
    let insertIds = []
    let sqlRecords = []
    let mongoRecords = []
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
            let arr = parseSQLType(record, tabledata)
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
            await dropDocumentMng({ data: id.id, collection: id.entityName })
        }
        result = []
        console.log({ error });
        throw error
    }

}

module.exports = { createSql, insertManySql, insertOne, creatNewColumn, insertMany, transactionCreate };
