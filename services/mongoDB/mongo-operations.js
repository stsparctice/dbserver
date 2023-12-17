require('dotenv').config();
const { getClient } = require('./mongo-connection');
const { MONGO_DB } = process.env;
const config = require('../../config/DBconfig.json');
const notifications = require('../../config/serverNotifictionsConfig.json');
const { ObjectId } = require('mongodb');
const { areaType, DBType } = require('../../utils/types');
const { geoWithinInCircle } = require('./mongo-geo');

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
                let { insertedId } = result;
                result = await this.findOne({ filter: { _id: insertedId } })
                result._id = insertedId.toString()

                return result
            }
            else {
                throw notifications.find(n => n.status == 400)
            }
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
    async findOne({ filter }) {
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).findOne(filter);
            return result;
        }
        catch (error) {
            console.log(error.message)
            throw (error)
        }
    }

    async find({ filter = {}, sort = {}, projection = {} } = {}) {
        if (filter._id) {
            filter._id = new ObjectId(obj.filter._id)
        }
        try {
            const result = await getClient().db(this.dbName).collection(this.collectionName).find(filter).sort(sort).project(projection).toArray();
            if (projection._id && projection._id === 0)
                return result
            return result.map(item => ({ ...item, _id: item._id.toString() }));
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

    async countDocuments(query = {}) {
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
                result = await getClient().db(this.dbName).collection(collection).drop()
            }
            else {
                result = await getClient().db(this.dbName).collection(this.collectionName).drop();
            }
            return result;
        }
        catch (error) {
            throw (error)
        }
    };

    async dropOneDocument(filter = {}) {
        try {
            if (filter._id) {
                filter._id = new ObjectId(filter._id)
            }
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

    async geoSearch({ filter = {}, sort = {}, projection = {} } = {}) {
        console.log('geoSearch')
        let result = []
        try {
            if (filter.type) {
                const { type, point } = filter
                console.log({ type })
                console.log(Object.values(point))
                if (type === areaType.RADIUS) {
                    // const radiusList = await this.find({ filter: { type } })
                    // console.log({ radiusList })
                    // if (radiusList.length > 0) {
                    //     const filters = await geoWithinInCircle(radiusList.map(({ radius, point }) => ({ radius, point })))
                    //     console.log(filters[0].pos)
                    //     const radius = await Promise.all(await filters.map(filter => getClient().db(this.dbName).collection('points').find(filter).toArray()))
                    //     await this.dropCollection('points')
                    const radius = await this.geoWithinRadius(point)
                    result = [...result, ...radius]

                }
                if (type === areaType.POINT) {
                    const points = await this.find({ filter, sort, projection })
                    result = [...result, ...points]
                }
                if (type === areaType.POLYGON) {
                    const polygons = await this.geoWithInPolygon(point)
                    result = [...result, ...polygons]
                }
                return result
            }
        }
        catch (error) {
            console.log({ error })
            throw error
        }
    }
    async geoWithInPolygon(point) {
        console.log({ point })
        try {
            if (point) {
                const index = await getClient().db(this.dbName).collection('points').createIndex({ pos: "2dsphere" })
                const polygons = await this.find({ filter: { type: areaType.POLYGON } })
                const insertPolygons = polygons.map(({ _id, name, points }) => {
                    return { id: _id, name, pos: { type: 'Polygon', coordinates: [points.map((p) => Object.values(p))] } }
                })
                const insertresult = await getClient().db(this.dbName).collection('points').insertMany(insertPolygons);

                const searchresult = await getClient().db(this.dbName).collection('points').find({
                    pos: {
                        $geoIntersects: {
                            $geometry: {
                                type: "Point",
                                coordinates: Object.values(point)
                            }
                        }
                    }
                }).toArray()
                await this.dropCollection('points')
                const originData = searchresult.map(({ id }) => id)
                const originPolygons = polygons.filter(({ _id }) => originData.includes(_id))
                return originPolygons
            }
        }

        catch (error) {
            console.log({ error })
            throw error
        }
    };

    async geoWithinRadius(point) {
        console.log({ point })
        try {
            if (point) {
                const index = await getClient().db(this.dbName).collection('points').createIndex({ pos: "2dsphere" })
                console.log(Object.values(point))
                const insertPoint = await getClient().db(this.dbName).collection('points').insertOne({ pos: { type: 'Point', coordinates: Object.values(point) } })
                const radiusList = await this.find({ filter: { type: areaType.RADIUS } })
                console.log({ radiusList })
                const searchresult = await Promise.all(radiusList.map(async (radius) => {
                    const ans = await getClient().db(this.dbName).collection('points').find({
                        pos: {
                            $geoWithin: { $centerSphere: [Object.values(radius.point), radius.radius/(1000*637810)] }
                        }
                    }).toArray()
                    console.log(ans)
                    if (ans.length > 0) {
                        return radius
                    }
                    else {
                        return undefined
                    }

                }))
                console.log('radius')
                console.log(searchresult)
                await this.dropCollection('points')
                return searchresult.filter(result => result !== undefined)
            }
        }

        catch (error) {
            console.log({ error })
            throw error
        }
    }
}

module.exports = MongoDBOperations;
