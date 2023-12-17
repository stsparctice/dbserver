require('dotenv').config()

const { read, readAll, countRows, join } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');

const { getConverter } = require('../services/sql/sql-convert-query-to-condition')
const { getSelectSqlQueryWithFK, autoCompleteQuery, convertType } = require('../services/sql/sql-queries')
const { getDBTypeAndName, getConnectionBetweenMongoAndSqlEntities, connectBetweenMongoAndSqlObjects } = require('./config/get-config');
const { getSQLReferencedColumns, getPrimaryKeyField, parseColumnName,
    getDefaultColumn, getColumnAlias, getTableFromConfig, getTableAlias,
    readJoin, parseSqlObjectToEntity, getTableColumns } = require('./config/config-sql');
const { DBType } = require('../utils/types');
const { removeKeysFromObject } = require('../utils/code');

const {SQL_DBNAME} = process.env



async function getDetailsSql(obj) {
    try {
        if (obj.entityName && !obj.tableName)
            obj.tableName = obj.entityName
        const response = await read(obj);
       return response
    }
    catch (error) {
        throw error
    }
};


async function getAllSql(obj) {
    try {
        const response = await readAll(obj);
       return response
    }
    catch (error) {
        throw error
    }
};

async function autoComplete({ entittyName, tableName, condition }) {

    try {
        const primaryKey = getPrimaryKeyField(tableName)
        const defaultValue = getDefaultColumn(tableName)
        const response = await read({ tableName, condition, n: 10, columns: [primaryKey, defaultValue] })
        return response
    }
    catch (error) {
        throw error
    }
}

async function readRelatedObjects(tablename, primaryKey, value, column) {
    try {
        column = column.sqlName
        let obj = {
            "tableName": `tbl_${tablename}`,
            "columns": '*',
            "condition": `${primaryKey}=${value}`
        }

        const allData = await read(obj)
        const refTablename = allData[0].TableName
        const refPrimaryKeyField = getPrimaryKeyField(refTablename)
        obj = {
            "tableName": refTablename,
            "columns": "*",
            "condition": `${refPrimaryKeyField} = ${allData[0][column]}`
        }
        const result = await read(obj)
        allData[0].TableName = result
        return allData
    }
    catch (error) {
        throw error
    }

}

async function readFullObjects(tablename) {

    try {
        const result = await getSQLReferencedColumns(tablename)
        return result
    }
    catch (error) {
        throw error
    }


}

async function readFullObjectsWithRef(table, fullObjects) {
    const TabeColumnName = getTabeColumnName(table)
    let y = await read({ tableName: `${table}`, columns: `${[...TabeColumnName]}` })
    let answer = await Promise.all(y.map(myFunction));
    async function myFunction(value) {
        value[`${fullObjects.name}`] = await read({ tableName: `${value[`${fullObjects.ref}`]}`, columns: '*', condition: `${await getPrimaryKeyField(value[`${fullObjects.ref}`])}='${value[fullObjects.name]}'` })
        return value;
    }
    return answer
}

async function readWithJoin(tableName, column) {
    try {

        const query = await readJoin(tableName, column);
        const values = await join(query);
        let result = [];
        if (values) {
            values.forEach(val => {
                const sameRecord = values.filter(v => v[`${tableName}_${column}`] === val[`${tableName}_${column}`]);
                const keys = Object.keys(sameRecord[0]);
                const temp = {}
                for (let key of keys) {
                    temp[key] = (sameRecord.map(sr => { return sr[key] })).reduce((state, next) => state.includes(next) ? [...state] : [...state, next], []);
                }
                result = result.filter(r => r[`${tableName}_${column}`][0] == temp[`${tableName}_${column}`][0]).length == 0 ? [...result, temp] : [...result];
            });
        }
        console.log("result")
        console.log(result)
        return result;
    }
    catch (error) {
        throw error
    }
}

async function readFromSql(obj) {
    try {
        const query = getSelectSqlQueryWithFK(obj);
        const values = await join(query);
        if (values.length > 0) {
            // const res = await selectReferenceColumn(values, obj.tableName);
            // console.log({res})
            const result = mapFKIntoEntity(values);
            const list = result.map(item=>parseSqlObjectToEntity(item, obj.entityName))
            return list;
            // return result;
        }
        else {
            return values
        }
    }
    catch (error) {
        console.log({ error })
        throw error
    }
}
const selectReferenceColumn = async (values, tableName) => {
    const columnReference = getSQLReferencedColumns(tableName)
    console.log({columnReference})
    if (columnReference.length > 0) {
        let tablesJoin = columnReference.reduce((list, { name, ref }) =>
            [...list, ...values.reduce((state, val) => val[name] !== null && state.includes(ref.ref_table) ? [...state] : [...state, ref.ref_table], [])], []
        );
        const alias = getTableAlias(tableName);

        let query = `${tableName} ${alias}`;
        let columns = ``
        columnReference.forEach(({ name, ref }) => {
            columns = `${alias}.${getPrimaryKeyField(tableName)}, ${alias}.${name}, ${alias}.${ref.ref_column}`
            tablesJoin.forEach((table) => {
                const currentAlias = getTableAlias(table);
                const defaultColumn = getDefaultColumn(table);
                const primaryKey = getPrimaryKeyField(table);
                columns = `${columns},${currentAlias}.${primaryKey} AS FK_${currentAlias}_${getColumnAlias(table, primaryKey)} ,${currentAlias}.${defaultColumn} AS FK_${currentAlias}_${getColumnAlias(table, defaultColumn)}`;
                query = `${query} LEFT JOIN ${table} ${currentAlias} ON ${convertType({ tableName: alias, column: name }, { tableName: currentAlias, column: getPrimaryKeyField(table) })}`
            })
        })
        query = `USE ${SQL_DBNAME} SELECT ${columns} FROM ${query}`;
        const res = await join(query);
        values.forEach((v) => {
            const find = res.find((r) => r[getPrimaryKeyField(tableName)] === v[getPrimaryKeyField(tableName)])
            for (let key in find) {
                if ((v[key] === null || v[key] === undefined) && find[key] !== null) {
                    v[key] = find[key]
                }
            }
        })
    }
    return values;

}

const mapFKIntoEntity = (entities) => {
    try {
        const items = []
        for (let entity of entities) {
            const entries = Object.entries(entity)
            const foreignkeys = entries.filter(e => e[0].startsWith('FK'))
            let groups = foreignkeys.reduce((gr, fk) => {
                const prop = fk[0].split('_')[1]
                if (!gr.some(g => g.name === prop)) {
                    let group = { name: prop, items: [fk] }
                    gr = [...gr, group]
                }
                else {
                    gr.find(g => g.name === prop).items.push(fk)
                }
                return gr
            }, [])
            const newObj = entries.reduce((obj, ent) => {
                if (ent[0].startsWith('FK')) {
                    return obj
                }
                const gr = groups.find(g => g.name === ent[0])
                if (gr) {
                    obj[ent[0]] = gr.items.reduce((val, v) => {
                        const split = v[0].split('_')
                        val[split[split.length - 1]] = v[1]
                        return val
                    }, {})
                }
                else {
                    obj[ent[0]] = ent[1]
                }
                return obj
            }, {});
            items.push(newObj)
        }
        return items;
    } catch (error) {
        throw error;
    }
}
async function countRowsSql(obj) {
    try {
        const convert = getConverter(getTableFromConfig(obj.tableName))
        obj.condition = convert.convertCondition(obj.condition)
        const count = await countRows(obj);

        return count.recordset[0];
    }
    catch (error) {
        throw error
    }
};

async function readFromSqlAndMongo(object) {
    try {
        const { sqlReferences } = getConnectionBetweenMongoAndSqlEntities({ mongoEntity: object.entityName, sqlEntity: object.entityName })
        // const referenceMongoFields = sqlReferences.map(({ reference }) => reference.field)
        let sqlCondition = {};
        let mongoCondition = {};
        let sqlFields = [];
        let mongoFields = []
        if (object.condition) {
            const { sqlValues, noSqlValues } = parseColumnName(object.condition, object.entityName)
            sqlCondition = sqlValues
            mongoCondition = noSqlValues
        }
        if (object.fields) {
            const { sqlValues, noSqlValues } = parseColumnName(object.fields, object.entityName)
            sqlFields = sqlValues
            mongoFields = noSqlValues
        }
        // const readMethods = [{
        //     type: DBType.SQL, read: readFromSql, param: {
        //         tableName: object.entityName, condition: sqlCondition, fields: sqlFields
        //     }
        // }, {
        //     type:DBType.MONGO, read:readFromMongo, param:{
        //         collection: object.entityName, filter: mongoCondition, fields: mongoFields
        //     }
        // }]
        let sqlResult = undefined
        let mongoResult = undefined
        if (object.fields) {
            if (sqlFields.length > 0) {
                sqlResult = await readFromSql({
                    tableName: object.entityName, condition: sqlCondition, fields: sqlFields
                })
            }
            if (mongoFields.length > 0) {
                mongoResult = await readFromMongo({ collection: object.entityName, filter: mongoCondition, fields: mongoFields })
            }
            if (mongoResult && sqlResult) {
                const result = connectBetweenMongoAndSqlObjects({ mongoObjects: mongoResult, sqlObjects: sqlResult, sqlReferences, entityName: object.entityName })
                return result
            }

            return mongoResult ? mongoResult : sqlResult

        }
        else {
            if (object.condition) {
                if (Object.keys(sqlCondition).length > 0)
                    sqlResult = await readFromSql({
                        tableName: object.entityName, condition: sqlCondition, fields: sqlFields
                    })

                if (Object.keys(mongoCondition).length > 0) {
                    mongoResult = await readFromMongo({ collection: object.entityName, filter: mongoCondition, fields: mongoFields })
                }

            }
            if (!sqlResult)
                sqlResult = await readFromSql({
                    tableName: object.entityName, condition: sqlCondition, fields: sqlFields
                })
            if (!mongoResult)
                mongoResult = await readFromMongo({ collection: object.entityName, filter: mongoCondition, fields: mongoFields })

            if (sqlResult && mongoResult) {
                const result = connectBetweenMongoAndSqlObjects({ mongoObjects: mongoResult, sqlObjects: sqlResult, sqlReferences, entityName: object.entityName })
                return result
            }

            // if (sqlResult.length > 0) {
            //     const response = await Promise.all(sqlResult.map(async (result) => {
            //         const condition = sqlReferences.reduce((filter, { reference, sqlName }) => {
            //             filter[reference.field] = result[sqlName]
            //             return filter
            //         }, {})
            //         const mongoResult = await readFromMongo({ collection: object.entityName, filter: condition })
            //         const mongoObject = removeKeysFromObject(mongoResult[0], referenceMongoFields)
            //         const fullObject = { ...parseSqlObjectToEntity(result, object.entityName), ...mongoObject }
            //         return fullObject
            //     }))
            //     return response
            // }
        }
    }
    catch (error) {
        console.log({ error })
        throw error
    }
}

async function readFromMongo({ collection, filter = {}, sort = {}, fields = [] }) {
    try {
        const mongoOperations = new MongoDBOperations(collection)
        let projection = {}
        if (fields.length > 0) {
            projection = fields.reduce((pro, item) => {
                pro[item] = 1
                return pro
            }, {})
        }
        console.log({ collection, filter })
        if (collection == 'areas' && Object.keys(filter).includes('point')) {
            const response = await mongoOperations.geoSearch({ filter, sort, projection })
            return response
        }
        else {
            const response = await mongoOperations.find({ filter, sort, projection });
            return response;
        }
    }
    catch (error) {
        throw error
    }
};

async function getPolygon(obj) {
    try {

        const mongoOperations = new MongoDBOperations(collection)
        const response = await mongoOperations.find({ filter: obj.filter });
        let areas = []
        for (let i = 0; i < response.length; i++) {
            const response2 = await mongoOperations.geoWithInPolygon(response[i].points, obj.point)
            if (response2.length > 0) {
                areas.push(response[i])
            }
        }
        return areas;
    }
    catch (error) {
        throw error
    }
}

async function getDetailsWithAggregateMng(obj) {
    try {
        const mongoOperations = new MongoDBOperations(collection)
        const response = await mongoOperations.aggregate(obj.aggregate);
        return response;
    }
    catch (error) {
        throw error
    }
};

async function getDetailsWithDistinct(collection, filter) {
    try {
        const mongoOperations = new MongoDBOperations(collection);
        const response = await mongoOperations.distinct(filter);
        return response;
    }
    catch (error) {
        throw error;
    }
};


async function getCountDocumentsMng({ collection, condition = {} }) {

    try {
        mongoCollection.setCollection(collection);
        const response = await mongoCollection.countDocuments(condition);
        return response;
    }
    catch (error) {
        throw error
    }
};

module.exports = {
    getDetailsSql,
    getAllSql, countRowsSql,
    readFullObjects, readFullObjectsWithRef, readRelatedObjects,
    readFromMongo, readWithJoin, autoComplete,
    readFromSqlAndMongo,
    getDetailsWithAggregateMng, getCountDocumentsMng, getDetailsWithDistinct, readFromSql, getPolygon
};
