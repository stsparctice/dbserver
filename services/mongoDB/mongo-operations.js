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
        try {
            let result;
            if (obj) {
                result = await getClient().db(this.dbName).collection(this.collectionName).insertOne(obj);
                result = result.insertedId;
            }
            else {
                throw new Error('Object is not valid.')
            }
            return result.toString();
        }
        catch (error) {
            throw (error)
        }
    };

    async find(obj = {}) {

        let sort = {};
        sort[obj.sort] = 1;
        console.log('hi')
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).find(obj.filter).sort(sort).toArray();
            console.log({ result })
            return result;
        }
        catch (error) {
            console.log(error.message)
            throw (error)
        }
    };

    async updateOne(obj) {
        try {
            // console.log('before', this.dbName, this.collectionName, obj.filter, obj.set);
            const result = await getClient().db(this.dbName).collection(this.collectionName).updateOne(obj.filter, obj.set);
            // console.log('after',result);
            return result;
        }
        catch (error) {
            throw (error)
        }
    };

    async countDocuments() {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).countDocuments();
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

    async dropOneDocument(filter = '') {
        try {
            console.log("filter in oper***********", filter);
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


                // result = result.insertedId;
                console.log({ insertresult })



                const arrayPoints = array.map((p) => Object.values(p))
                console.log(arrayPoints)

                // console.log({'104':[arrayPoints[104], arrayPoints[105]]})
                // console.log({'104':[arrayPoints[106], arrayPoints[107]]})
                const searchresult = await getClient().db(this.dbName).collection('points').find(
                    {
                        pos: {
                            $geoIntersects: {
                                $geometry: {
                                    type: "MultiPolygon",
                                    coordinates: [
                                        [arrayPoints]
                                    ],
                                    // crs: {
                                    //     type: "name",
                                    //     properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
                                    // }
                                }
                            }
                        }

                    }
                ).toArray()
                console.log({ searchresult })
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
