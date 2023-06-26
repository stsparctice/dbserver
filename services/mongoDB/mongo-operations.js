require('dotenv').config();
const { getClient } = require('./mongo-connection');
const { MONGO_DB } = process.env;
const config = require('../../config.json');

class MongoDBOperations {

    constructor(collectionName, dbName = MONGO_DB) {
        this.collectionName = collectionName;
        this.dbName = dbName;
        this.collections = config[1]['mongodb'];
    };

    async setCollection(collection) {
        this.collectionName = collection
    };

    async insertOne(obj = null) {
        let result;
        if (obj) {
            result = await getClient().db(this.dbName).collection(this.collectionName).insertOne(obj);
            result = result.insertedId;
            console.log(result.toString())
        }
        else {
            return false
        }
        return result.toString();
    };

    async find(obj = {}) {
        console.log("im here");      
        let sort = {};
        sort[obj.sort] = 1;
        const result = await getClient().db(this.dbName).collection(this.collectionName).find(obj.filter).sort(sort).toArray();
        return result;
    };

    async updateOne(obj) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).updateOne(obj.filter, obj.set);
        return result;
    };

    async countDocuments() {
        const result = await getClient().db(this.dbName).collection(this.collectionName).countDocuments();
        return result;
    };

    async aggregate(array = []) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).aggregate(array).toArray();
        return result;
    };

    async distinct(filter = '') {
        console.log('filter----------',filter);
        const result = await getClient().db(this.dbName).collection(this.collectionName).distinct(filter)
        console.log('result----------',result);
        return result;
    }

    async dropCollection() {
        const result = await getClient().db(this.dbName).collection(this.collectionName).drop((err, delOK) => {
            if (err) throw err;
            if (delOK) return "c v nollection deleted";
        });
        return result;
    };

    async complete(obj){
        const result = await getClient().db(this.dbName).collection(this.collectionName).find().toArray();
        return result;
    }

};

const mongo = new MongoDBOperations();
module.exports = mongo;
