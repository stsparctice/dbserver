const { read, readAll, countRows, join } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { readJoin, viewConnectionsTables } = require('./config/config');
const config = require('../config.json');
const mongoCollection = MongoDBOperations;

async function getDetailsSql(obj) {
    const list = await read(obj);
    return list;
};

async function getAllSql(obj) {
    console.log("555555555555555555");
    const list = await readAll(obj);
    return list;
};

async function readWithJoin(tableName, column) {
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
async function connectTables(tableName = "",condition="") {
    const query = viewConnectionsTables(tableName,condition);
    const values = await join(query);
    if (values) {
        return values;
    }
    else {
        return false;
    }
}

async function countRowsSql(obj) {
    const list = await countRows(obj);
    return list;
};

async function getDetailsMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.find(obj);
    return response;
};

async function getDetailsWithAggregateMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.aggregate(obj.aggregate);
    return response;
};

async function getDetailsWithDistinct(collection,filter) {
    mongoCollection.setCollection(collection);
    const response = await mongoCollection.distinct(filter);
    return response;
};

async function getCountDocumentsMng(collection) {
    mongoCollection.setCollection(collection);
    const response = await mongoCollection.countDocuments();
    return response;
};

module.exports = { getDetailsSql, getAllSql, readJoin, countRowsSql, getDetailsMng, readWithJoin, getDetailsWithAggregateMng, getCountDocumentsMng,getDetailsWithDistinct,connectTables };
