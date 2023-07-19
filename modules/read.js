const { read, readAll, countRows, join } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { readJoin, readRelatedData, getTableFromConfig } = require('./config/config');
const { getReferencedColumns, getPrimaryKeyField, parseSQLTypeForColumn, buildSqlCondition } = require('./public');
const { viewConnectionsTables, autoCompleteQuery } = require('../services/sql/sql-queries')
const { convertToSqlCondition } = require('../utils/convert_condition');

const mongoCollection = MongoDBOperations;


async function getDetailsSql(obj) {
    try {
        if (obj.entityName && !obj.tableName)
            obj.tableName = obj.entityName
        const list = await read(obj);
        return list;
    }
    catch (error) {
        throw error
    }
};


async function getAllSql(obj) {
    try {
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
        console.log({ column })
        let obj = {
            "tableName": `tbl_${tablename}`,
            "columns": '*',
            "condition": `${primaryKey}=${value}`
        }

        console.log({ tablename })
        const allData = await read(obj)

        console.log({ allData })

        const refTablename = allData[0].TableName
        const refPrimaryKeyField = getPrimaryKeyField(refTablename)

        obj = {
            "tableName": refTablename,
            "columns": "*",
            "condition": `${refPrimaryKeyField} = ${allData[0][column]}`
        }
        const result = await read(obj)
        console.log({ result });
        allData[0].TableName = result
        return allData
    }
    catch (error) {
        throw error
    }

}

async function readFullObjects(tablename) {
    console.log('readFullObjects:', tablename)

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
    console.log({ answer });
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
        const values = await join(query);
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

    }
    catch (error) {
        throw error
    }
}


async function countRowsSql(obj) {
    console.log({ obj })
    try {
        obj.condition = convertToSqlCondition(obj.tableName, obj.condition)
        const count = await countRows(obj);
        console.log({ count })
        return count.recordset[0];
    }
    catch (error) {
        console.log(error)
        throw error
    }
};

async function getDetailsMng(obj) {
    try {
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
        console.log({ obj })
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.find({ filter: obj.filter });
        // console.log(/)
        let areas = []
        for (let i = 0; i < response.length; i++) {
            const response2 = await mongoCollection.geoWithInPolygon(response[i].points, obj.point)
            console.log({ response2 })
            if (response2.length > 0) {
                areas.push(response[i])
            }
        }
        console.log('areas')
        console.log(areas)
        return areas;
    }
    catch (error) {
        console.log(error.message)
        throw error
    }
}

async function getDetailsWithAggregateMng(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.aggregate(obj.aggregate);
        return response;
    }
    catch (error) {
        throw error
    }
};

async function getDetailsWithDistinct(collection, filter) {
    try {
        mongoCollection.setCollection(collection);
        const response = await mongoCollection.distinct(filter);
        return response;
    }
    catch (error) {
        throw error
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
    getAllSql, readJoin, countRowsSql,
    readFullObjects, readFullObjectsWithRef, readRelatedObjects,
    getDetailsMng, readWithJoin, autoComplete,
    getDetailsWithAggregateMng, getCountDocumentsMng, getDetailsWithDistinct, connectTables, getPolygon
};
