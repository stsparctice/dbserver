const { read, readAll, countRows, join } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');

const { readJoin, getTableFromConfig } = require('./config/config');
const { getReferencedColumns, getPrimaryKeyField, parseSQLTypeForColumn, getAlias, getDefaultColumn, getColumnAlias } = require('./public');
const { viewConnectionsTables, autoCompleteQuery, convertType } = require('../services/sql/sql-queries')
const { convertToSqlCondition } = require('../utils/convert_condition');



const config = require('../config/DBconfig.json');
const { parseDBname } = require('../utils/parse_name');


const mongoCollection = MongoDBOperations;


async function getDetailsSql(obj) {
    try {
        if (obj.entityName && !obj.tableName)
            obj.tableName = obj.entityName
        const list = await read(obj);
        return list;
    }
    catch {
        // object.error = 'Read faild.'
        // Log(object)
        throw new Error('Read faild.')
    }
};


async function getAllSql(obj) {
    try {
        // object.push({
        //     name: "getAllSql",
        //     path: "modules /read",
        //     body: obj
        // })
        const list = await readAll(obj);
        return list;
    }
    catch (error) {
        throw error
    }
};

async function autoComplete(obj) {
    try {
        const objectWithQuery = autoCompleteQuery({ entity: obj.entity, column: obj.column }, obj.condition)
        const response = await read(objectWithQuery)
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
        const result = await getReferencedColumns(tablename)
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
        return result;
    }
    catch (error) {
        throw error
    }
}

async function connectTables(obj) {
    try {
        const query = viewConnectionsTables(obj);
        console.log({query});
        const values = await join(query);
        const res = await selectReferenceColumn(values, obj.tableName);
        const result = mapEntity(res);
        return result;
    }
    catch (error) {
        throw error
    }
}
const selectReferenceColumn = async (values, tableName) => {
    const columnReference = getReferencedColumns(tableName)
    if(columnReference.length>0){
        let tablesJoin = []
        columnReference.map(({ ref }) => {
            tablesJoin = [...tablesJoin, ...values.reduce((state, val) => val[ref] !== null ? state.includes(parseDBname(val[ref]).entityName) ? [...state] : [...state, parseDBname(val[ref]).entityName] : [...state], [])];
        });
        const alias = getAlias(tableName);
        let query = `${tableName} ${alias}`;
        let columns = ``
        columnReference.map(({ name, ref }) => {
            columns = `${alias}.${getPrimaryKeyField(tableName)}, ${alias}.${name}, ${alias}.${ref}`
            tablesJoin.map((table) => {
                const currentAlias = getAlias(table);
                const defaultColumn = getDefaultColumn(table);
                const primaryKey = getPrimaryKeyField(table);
                columns = `${columns},${currentAlias}.${primaryKey} AS FK_${currentAlias}_${getColumnAlias(table, primaryKey)} ,${currentAlias}.${defaultColumn} AS FK_${currentAlias}_${getColumnAlias(table, defaultColumn)}`;
                query = `${query} LEFT JOIN ${table} ${currentAlias} ON ${convertType({ tableName: alias, column: name }, { tableName: currentAlias, column: getPrimaryKeyField(table) })}`
            })
        })
        query = `SELECT ${columns} FROM ${query}`;
        const res = await join(query);
        values.map((v) => {
           const find= res.find((r) => r[getPrimaryKeyField(tableName)] === v[getPrimaryKeyField(tableName)])
           console.log({find});
           for(let key in find){
                if((v[key]===null||v[key]===undefined)&&find[key]!==null){
                    v[key]=find[key]
                }
           }
        })
        console.log(values);
    }
    return values;

}

const mapEntity = (values) => {
    try {
        const items = []
        for (let val of values) {
            const entries = Object.entries(val)
            const foreignkeys = entries.filter(e => e[0].startsWith('FK'))
            let groups = foreignkeys.reduce((gr, fk) => {
                const prop = fk[0].split('_')[1]
                if (!gr.some(g => g.name === prop)) {
                    let group = { name: prop, values: [fk] }
                    gr = [...gr, group]
                }
                else {
                    gr.find(g => g.name === prop).values.push(fk)
                }
                return gr
            }, [])
            const newObj = entries.reduce((obj, ent) => {
                if (ent[0].startsWith('FK')) {
                    return obj
                }
                const gr = groups.find(g => g.name.indexOf(ent[0]) !== -1)
                if (gr) {
                    obj[ent[0]] = gr.values.reduce((val, v) => {
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
        obj.condition = convertToSqlCondition(getTableFromConfig(obj.tableName), obj.condition)
        const count = await countRows(obj);

        return count.recordset[0];
    }
    catch {
        object.error = 'Count faild.'
        Log(object)
        throw new Error('Count faild.')
    }
};

async function getDetailsMng(obj, object) {
    try {
        object.push({
            name: "getDetailsMng",
            path: "modules /read",
            body: obj
        })
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.find(obj);
        return response;
    }
    catch (error) {
        throw error
    }
};

async function getPolygon(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.find({ filter: obj.filter });
        let areas = []
        for (let i = 0; i < response.length; i++) {
            const response2 = await mongoCollection.geoWithInPolygon(response[i].points, obj.point)
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
        object.push({
            name: "getDetailsWithAggregateMng",
            path: "modules /read",
            body: obj
        })
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.aggregate(obj.aggregate);
        return response;
    }
    catch {
        object.error = 'Read with Aggregate faild.'
        Log(object)
        throw new Error('Read with Aggregate faild.')
    }
};

async function getDetailsWithDistinct(collection, filter, object) {
    try {
        object.push({
            name: "getDetailsWithDistinct",
            path: "modules /read",
            body: obj
        })
        mongoCollection.setCollection(collection);
        const response = await mongoCollection.distinct(filter);
        return response;
    }
    catch {
        object.error = 'Read with distinct faild.'
        Log(object)
        throw new Error('Read with distinct faild.')
    }
};


async function getCountDocumentsMng({ collection, condition = {} }) {

    try {
        object.push({
            name: "getCountDocumentsMng",
            path: "modules /read",
            body: obj
        })
        mongoCollection.setCollection(collection);
        const response = await mongoCollection.countDocuments(condition);
        return response;
    }
    catch {
        object.error = 'Count faild.'
        Log(object)
        throw new Error('Count faild.')
    }
};

module.exports = {
    getDetailsSql,
    getAllSql, readJoin, countRowsSql,
    readFullObjects, readFullObjectsWithRef, readRelatedObjects,
    getDetailsMng, readWithJoin, autoComplete,
    getDetailsWithAggregateMng, getCountDocumentsMng, getDetailsWithDistinct, connectTables, getPolygon
};
