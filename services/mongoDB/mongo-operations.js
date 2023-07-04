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
        }
        else {
            throw new Error('Object is not valid.')
        }
        return result.toString();
    };

    async find(obj = {}) {
        try {

            let sort = {};
            sort[obj.sort] = 1;
            const result = await getClient().db(this.dbName).collection(this.collectionName).find(obj.filter).sort(sort).toArray();
            return result;
        }
        catch {
            throw new Error('Object is not valid.')
        }
    };

    async updateOne(obj) {
        try{

            const result = await getClient().db(this.dbName).collection(this.collectionName).updateOne(obj.filter, obj.set);
            return result;
        }
        catch(error){
            throw error
        }
    };

    async countDocuments() {
        try{
            const result = await getClient().db(this.dbName).collection(this.collectionName).countDocuments();
            return result;
        }
        catch{
            throw new Error(`Collection: ${this.collectionName} is not exsist.`)
        }
    };

    async aggregate(array = []) {
        try {

            const result = await getClient().db(this.dbName).collection(this.collectionName).aggregate(array).toArray();
            return result;
        }
        catch {
            throw new Error('Array is not valid.')
        }
    };

    async distinct(filter = '') {
        try {

            const result = await getClient().db(this.dbName).collection(this.collectionName).distinct(filter)
            return result;
        }
        catch {
            throw new Error('Filter is not valid.')
        }
    }

    async dropCollection() {
        const result = await getClient().db(this.dbName).collection(this.collectionName).drop((err, delOK) => {
            if (err) throw err;
            if (delOK) return "c v nollection deleted";
        });
        return result;
    };

    async dropDocument(filter = '') {
        // console.log("filter in oper***********", filter);
        const result = await getClient().db(this.dbName).collection(this.collectionName).deleteOne(filter);
        return result;
    };

    async complete(obj) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).find().toArray();
        return result;
    }
};

const mongo = new MongoDBOperations();
module.exports = mongo;
