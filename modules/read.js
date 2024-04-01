require('dotenv').config()

const { read, readAll, countRows } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');

const { getConverter } = require('../services/sql/sql-convert-query-to-condition')
const { getSelectSqlQueryWithFK, convertType, selectQuery, selectOneTableQuery, readFullEntityQuery, selectFromMutipleTablesQuery, existQuery } = require('../services/sql/sql-queries')
const { getConnectionBetweenMongoAndSqlEntities, connectBetweenMongoAndSqlObjects, parseColumnName } = require('./config/get-config');
const { getSQLReferencedColumns, getPrimaryKeyField,
    getDefaultColumn, getColumnAlias, getTableFromConfig, getTableAlias,
    parseSqlObjectToEntity, buildFullReferences, parseOneColumnSQLType, getSqlTableColumnsType, getInnerReferencedColumns, getTableSQLName, getForeignTableDefaultColumn } = require('./config/config-sql');
const { removeKeysFromObject, groupByObjects, distinctObjectsArrays, isEmpyObject } = require('../utils/code');
const { getAllUniqueGroupsForTable } = require('./config/config-unique');

const { SQL_DBNAME } = process.env

async function autoComplete({ entittyName, tableName, condition }) {

    try {
        const primaryKey = getPrimaryKeyField(tableName)
        const defaultValue = getDefaultColumn(tableName)
        const query = selectOneTableQuery({ tableName, condition, n: 10, columns: [primaryKey, defaultValue] })
        const response = await read(query)
        return response
    }
    catch (error) {
        throw error
    }
}

async function existInSql({ tableName, condition }) {
    try {
        const query = existQuery({ tableName, condition })
        const result = await read(query)
        return result
    }
    catch (error) {
        throw error
    }
}

async function getDetailsSql(obj) {
    try {
        if (obj.entityName && !obj.tableName)
            obj.tableName = obj.entityName
        let query = selectOneTableQuery({ tableName: obj.tableName })
        const response = await read(query);
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

async function readRelatedObjects(tablename, primaryKey, value, column) {
    try {
        column = column.sqlName
        let obj = {
            "tableName": `tbl_${tablename}`,
            "columns": '*',
            "condition": `${primaryKey}=${value}`
        }
        const query1 = selectOneTableQuery(obj)
        const allData = await read(query1)
        const refTablename = allData[0].TableName
        const refPrimaryKeyField = getPrimaryKeyField(refTablename)
        obj = {
            "tableName": refTablename,
            "columns": "*",
            "condition": `${refPrimaryKeyField} = ${allData[0][column]}`
        }
        const query2 = selectOneTableQuery(obj)
        const result = await read(query2)
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
    console.log({ TabeColumnName });
    const query = selectOneTableQuery({ tableName: `${table}`, columns: `${[...TabeColumnName]}` })
    let data = await read(query)
    let answer = await Promise.all(data.map(async item => {
        const query = selectOneTableQuery({ tableName: `${item[`${fullObjects.ref}`]}`, columns: '*', condition: `${getPrimaryKeyField(item[`${fullObjects.ref}`])}='${item[fullObjects.name]}'` })
        item[`${fullObjects.name}`] = await read(query)
        return item;
    }))
    return answer
}

function buildConditionObject({ entityName, property, value }) {
    const conditionTable = getTableFromConfig(entityName)
    const conditionProperty = conditionTable.columns.find(({ name }) => name === property)
    let field = getPrimaryKeyField(entityName)
    if (conditionProperty) {
        field = conditionProperty.sqlName
    }

    const tableData = getSqlTableColumnsType(entityName)
    value = parseOneColumnSQLType({ name: field, value }, tableData)
    return { table: entityName, field, value }
}

async function buildObjectFromConnectedTables({ table, data }) {
    let objectData = data.map(item => {
        const keys = Object.keys(item)
        const mainKeys = keys.filter(key => {
            const splitKey = key.split('_')
            if (splitKey[0] === table.alias)
                return key
        })
        const removeKeys = keys.filter(key => mainKeys.includes(key) === false)
        return removeKeysFromObject(item, removeKeys)
    })
    if (objectData.every(item => isEmpyObject(item))) {
        return []
    }
    objectData = objectData.map(obj => {
        let changeKeys = Object.entries(obj).map(ent => {
            ent[0] = ent[0].split('_')[1]
            return ent
        })
        return Object.fromEntries(changeKeys)
    })
    let primaryKey = getPrimaryKeyField(table.alias)
    let groupObjects = groupByObjects(objectData, primaryKey)
    let objectsList = groupObjects.map(({ value }) => distinctObjectsArrays(value)).reduce((arr, item) => arr = [...arr, ...item], [])
    const innerReferrences = getInnerReferencedColumns(table.alias)
    console.log({ innerReferrences })
    if (innerReferrences.length > 0) {
        for (let innerRef of innerReferrences) {
            objectsList = await Promise.all(objectsList.map(async item => {
                let ref_table = getTableSQLName(item[innerRef.reference])
                let ref_column = getPrimaryKeyField(item[innerRef.reference])
                const condition = {}
                condition[ref_column] = item[innerRef.sqlName]
                const defaultColumn = getForeignTableDefaultColumn(ref_table)
                console.log(ref_column, defaultColumn);
                let readquery = selectOneTableQuery({ tableName: ref_table, condition, columns: [ref_column, defaultColumn], n: 1 })
                const result = await read(readquery)
                item[innerRef.sqlName] = result[0]
                return item
            }))
        }
    }
    if (table.references.length > 0) {
        for (let reference of table.references) {
            if (reference.references.length > 0) {
                for (let ref2 of reference.references) {
                    objectsList = await Promise.all(objectsList.map(async obj => {
                        let response = await buildObjectFromConnectedTables({ table: ref2, data })
                        let groups = groupByObjects(response, reference.foreignkeys.ref.ref_column)
                        obj[reference.foreignkeys.table.alias] = groups.map(({ value }) => distinctObjectsArrays(value)).reduce((arr, item) => arr = [...arr, ...item], [])
                        return obj
                    }))
                }
            }
        }
    }
    return objectsList
}

async function readFullEntity(request) {
    try {
        const { tableName, condition } = request
        const table = getTableFromConfig(tableName)
        const mainTable = buildFullReferences(table)
        const sqlConditionObject = buildConditionObject(condition)
        const query = readFullEntityQuery({ mainTable, condition: sqlConditionObject });
        let values = await read(query);

        let result = [];
        if (values) {
            values = values.map(item => {
                let removeKeys = Object.keys(item).filter(key => item[key] === null)
                return removeKeysFromObject(item, removeKeys)
            })
            result = await buildObjectFromConnectedTables({ table: mainTable, data: values })
        }
        result = result.map(item => parseSqlObjectToEntity(item, mainTable.alias))
        return result;
    }
    catch (error) {
        throw error
    }
}

async function readFromSql(obj) {
    try {
        const query = getSelectSqlQueryWithFK(obj);
        const values = await read(query);
        if (values.length > 0) {
            const result = mapFKIntoEntity(values);
            const list = result.map(item => parseSqlObjectToEntity(item, obj.tableName))
            return list;
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

async function readUniqueDataInMoreEntities({ entityName, condition = {}, data }) {
    const tableName = getTableSQLName(entityName)
    const uniqueGroups = getAllUniqueGroupsForTable(tableName)
    const selectQueries = uniqueGroups.map(({ name, fields }) => ({ name, queries: fields.map(({ table, sqlName }) => selectQuery({ tableName: table, columns: [sqlName], condition })) }))
    selectQueries.forEach((q) => {
        q.uniqueQuery = selectFromMutipleTablesQuery({ queries: q.queries })
    })
    const responseAll = await Promise.all(selectQueries.map(
        async ({ name, uniqueQuery }) => {
            const response = await read(uniqueQuery)
            return ({ name, response })
        }))
    const responseList = responseAll.map(({ name, response }) => {
        let arr = response.reduce((list, item) =>
            [...list, ...Object.values(item)]
            , [])
        const allowNulls = uniqueGroups.find(ug => ug.name === name).allowNulls
        if (allowNulls) {
            arr = arr.filter(item => item)
        }
        let obj = {}
        obj[name] = arr
        return obj
    })

    return responseList
}

const selectReferenceColumn = async (values, tableName) => {
    const columnReference = getSQLReferencedColumns(tableName)
    console.log({ columnReference })
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
        console.log({ object })
        const { sqlReferences } = getConnectionBetweenMongoAndSqlEntities({ mongoEntity: object.entityName, sqlEntity: object.entityName })
        // const referenceMongoFields = sqlReferences.map(({ reference }) => reference.field)
        let sqlCondition = {};
        let mongoCondition = {};
        let sqlFields = [];
        let mongoFields = []
        if (object.condition) {
            const { sqlValues, noSqlValues } = parseColumnName(object.condition, object.entityName)
            sqlCondition = sqlValues ?? {}
            mongoCondition = noSqlValues ?? {}
        }
        if (object.fields) {
            const { sqlValues, noSqlValues } = parseColumnName(object.fields, object.entityName)
            sqlFields = sqlValues ?? []
            mongoFields = noSqlValues ?? []
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
        console.log(object.fields)
        console.log(object.condition)
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
                console.log(sqlCondition)
                console.log({ object })
                if (Object.keys(sqlCondition).length > 0)
                    sqlResult = await readFromSql({
                        tableName: object.entityName, condition: sqlCondition, fields: sqlFields
                    })
                console.log(mongoCondition)
                if (Object.keys(mongoCondition).length > 0) {
                    mongoResult = await readFromMongo({ collection: object.entityName, filter: mongoCondition, fields: mongoFields })
                }

            }
            console.log(mongoResult === undefined && sqlResult === undefined)
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
            console.log({ response })
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
    readUniqueDataInMoreEntities, existInSql,
    readFullObjects, readFullObjectsWithRef, readRelatedObjects,
    readFromMongo, readFullEntity, autoComplete,
    readFromSqlAndMongo,
    getDetailsWithAggregateMng, getCountDocumentsMng, getDetailsWithDistinct, readFromSql, getPolygon
};
