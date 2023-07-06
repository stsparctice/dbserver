const { read, readAll, countRows, join } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { readJoin, viewConnectionsTables } = require('./config/config');
const config = require('../config.json');
const { Log } = require('../services/log/log');
const mongoCollection = MongoDBOperations;

async function getDetailsSql(obj) {
    try {
        // object.push({
        //     name: "getDetailsSql",
        //     path: "modules /read",
        //     body: obj
        // })
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
    catch {
        // object.error = 'Read faild.'
        // Log(object)
        throw new Error('Read faild.')
    }
};

async function readWithJoin(tableName, column, object) {
    object.push({
        name: "readWithJoin",
        path: "modules /read",
        body: obj
    })
    // Log(object)
    const query = await readJoin(tableName, column);
    const values = await join(query, object);
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
async function connectTables(tableName = "", condition = "", object) {
    object.push({
        name: "connectTables",
        path: "modules /read",
        body: obj
    })
    // Log(object)
    const query = viewConnectionsTables(tableName, condition);
    const values = await join(query, object);
    if (values) {
        return values;
    }
    else {
        return false;
    }
}

async function countRowsSql(obj, object) {
    try {
        object.push({
            name: "countRowsSql",
            path: "modules /read",
            body: obj
        })
        const list = await countRows(obj, object);
        return list;
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
    catch {
        object.error = 'Read faild.'
        Log(object)
        throw new Error('Read faild.')
    }
};

async function getDetailsWithAggregateMng(obj, object) {
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

async function getCountDocumentsMng(collection, object) {
    try {
        object.push({
            name: "getCountDocumentsMng",
            path: "modules /read",
            body: obj
        })
        mongoCollection.setCollection(collection);
        const response = await mongoCollection.countDocuments();
        return response;
    }
    catch {
        object.error = 'Count faild.'
        Log(object)
        throw new Error('Count faild.')
    }
};

module.exports = { getDetailsSql, getAllSql, readJoin, countRowsSql, getDetailsMng, readWithJoin, getDetailsWithAggregateMng, getCountDocumentsMng, getDetailsWithDistinct, connectTables };
