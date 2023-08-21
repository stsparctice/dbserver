require('dotenv').config();
const { getClient } = require('./mongo-connection');
const { MONGO_DB } = process.env;
const config = require('../../config/DBconfig.json');
const notifications = require('../../config/serverNotifictionsConfig.json')

class MongoDBOperations {

    constructor(collectionName, dbName = MONGO_DB) {
        this.collectionName = collectionName;
        this.dbName = dbName;
        this.collections = config.find(({ database }) => database === "mongoDB").collections;
    };

    async setCollection(collection) {
        this.collectionName = collection;
    };

    async insertOne(obj = null) {
        try {
            let result;
            if (obj) {
                console.log({ obj });
                result = await getClient().db(this.dbName).collection(this.collectionName).insertOne(obj);
                result = result.insertedId;
            }
            else {
                throw notifications.find(n => n.status == 400)
            }
            return result;
        }
        catch (error) {
            throw error
        }
    };
    async insertMany(array) {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).insertMany(array);
            if (result)
                return result.insertedIds;
            else {
                throw notifications.find(n => n.status === 500);
            }
        }
        catch (error) {
            throw error;
        }
    }

    async find(obj = {}) {

        let sort = {};
        sort[obj.sort] = 1;
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).find(obj.filter).sort(sort).toArray();
            return result;
        }
        catch (error) {
            console.log(error.message)
            throw (error)
        }
    };

    async updateOne(obj) {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).updateOne(obj.filter, obj.set);
            return result;
        }
        catch {
            throw notifications.find(n => n.status == 400)
        }
    };

    async updateMany(obj) {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).updateMany(obj.filter, obj.set);
            return result;
        }
        catch (error) {
            throw error
        }
    }

    async countDocuments(query={}) {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).countDocuments(query);
            return result;
        }
        catch (error) {
            throw (error)
        }
    };

    async aggregate(array = []) {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).aggregate(array).toArray();
            return result;
        }
        catch (error) {
            throw (error)
        }
    };

    async distinct(filter = '') {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).distinct(filter)
            return result;
        }
        catch (error) {
            throw (error)
        }
    }

    async dropCollection(collection) {
        try {
            let result
            if (collection) {
                result = await getClient().db(this.dbName).collection(collection).drop((err, delOK) => {
                    if (err) throw err;
                    if (delOK) return "c v nollection deleted";
                });
            }
            else {
                result = await getClient().db(this.dbName).collection(this.collectionName).drop((err, delOK) => {
                    if (err) throw err;
                    if (delOK) return "c v nollection deleted";
                });
            }
            return result;
        }
        catch (error) {
            throw (error)
        }
    };

    async dropOneDocument(filter = {}) {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).deleteOne(filter);
            if (result.deletedCount === 0) {
                return false
            }
            return true
        }
        catch (error) {
            throw (error)
        }
    };

    async complete(obj) {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).find().toArray();
            return result;
        }
        catch (error) {
            throw (error)
        }
    }


    async geoWithInPolygon(array, point) {
        console.log({ point })
        try {
            if (point) {
                const index = await getClient().db(this.dbName).collection('points').createIndex({ pos: "2dsphere" })

                const insertresult = await getClient().db(this.dbName).collection('points').insertOne({
                    pos: {
                        type: "Point", coordinates: Object.values(point.point)
                    }
                });
                const arrayPoints = array.map((p) => Object.values(p))
                const searchresult = await getClient().db(this.dbName).collection('points').find(
                    {
                        pos: {
                            $geoIntersects: {
                                $geometry: {
                                    type: "MultiPolygon",
                                    coordinates: [
                                        [arrayPoints]
                                    ]
                                }
                            }
                        }

                    }
                ).toArray()
                await this.dropCollection('points')
                return searchresult
            }
        }

        catch (error) {
            throw error
        }
    };
}

const mongo = new MongoDBOperations();
module.exports = mongo;
