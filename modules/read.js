const { read, readAll, countRows, join } = require('../services/sql/sql-operations');
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const { readJoin, viewConnectionsTables } = require('./config/config');
const config = require('../config.json');
const mongoCollection = MongoDBOperations;

async function getDetailsSql(obj) {
    try {
        const list = await read(obj);
        return list;
    }
    catch {
        throw new Error('Read faild.')
    }
};

async function getAllSql(obj) {
    try {
        const list = await readAll(obj);
        return list;
    }
    catch {
        throw new Error('Read faild.')
    }
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
async function connectTables(tableName = "", condition = "") {
    const query = viewConnectionsTables(tableName, condition);
    const values = await join(query);
    if (values) {
        return values;
    }
    else {
        return false;
    }
}

async function countRowsSql(obj) {
    try {
        const list = await countRows(obj);
        return list;
    }
    catch {
        throw new Error('Count faild.')
    }
};

async function getDetailsMng(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.find(obj);
        return response;
    }
    catch (error) {
        console.log(error.message)
        throw new Error('Read faild.')
    }
};

async function getPolygon(obj) {
    try {
        console.log({ obj })
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.find({ filter: obj.filter });
        let areas = []
        for (let i = 0; i < response.length; i++) {
            console.log("response[i].points", response[response.length - 1]);
            // if (!response[i].points.every((a) => a === undefined) && !response[i].places_id.every((a) => a === undefined)) {
                const response2 = await mongoCollection.geoWithInPolygon(response[i].points, obj.point)
                // console.log({ response2 })
                if (response2.length > 0) {
                    areas.push(response[i])
                }
            // }
        }
        // console.log('areas')
        // console.log(areas)
        return areas;
    }
    catch (error) {
        console.log(error.message)
        throw new Error('Read faild.')
    }
}

async function getDetailsWithAggregateMng(obj) {
    try {
        mongoCollection.setCollection(obj.collection);
        const response = await mongoCollection.aggregate(obj.aggregate);
        return response;
    }
    catch {
        throw new Error('Read with Aggregate faild.')
    }
};

async function getDetailsWithDistinct(collection, filter) {
    try {
        mongoCollection.setCollection(collection);
        const response = await mongoCollection.distinct(filter);
        return response;
    }
    catch {
        throw new Error('Read with distinct faild.')
    }
};

async function getCountDocumentsMng(collection) {
    try {
        mongoCollection.setCollection(collection);
        const response = await mongoCollection.countDocuments();
        return response;
    }
    catch {
        throw new Error('Count faild.')
    }
};

module.exports = {
    getDetailsSql,
    getAllSql, readJoin, countRowsSql,
    getDetailsMng, readWithJoin,
    getDetailsWithAggregateMng, getCountDocumentsMng, getDetailsWithDistinct, connectTables, getPolygon
};
