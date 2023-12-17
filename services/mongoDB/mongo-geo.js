const { areaType } = require("../../utils/types")
const MongoDBOperations = require("./mongo-operations")


async function buildFiltersToSearchPointInAreas( type, collection) {
    const mongoOperations = new MongoDBOperations(collection)
    if (type === areaType.RADIUS) {
        //point and radius
        const radiusList = await mongoOperations.find({ type })
        console.log({ radiusList })
        if (radiusList.length > 0) {
            const filters = await geoWithinInCircle( radiusList.map(({ radius, point }) => ({radius, point})))
            // console.log("result in circle", result);

            return filters
        }
        else {
            return false
        }
    }
    if (type === areaType.POLYGON) {
        //polygon
        const polygonList = await mongoOperations.find({ type })
        const result = await geoWithInPolygon(polygonList.map(({points})=>points))
        // console.log("result in polygon", result);

        if (result.length > 0) {
            // console.log("good!!!!!!!!!!");
            return true
        }
        else {
            // console.log("bad!!!!!!!!!!");
            return false
        }
    }
}


//mongo operation
async function geoWithInPolygon(array) {

    // const result = await getClient().db(this.dbName).collection(this.collectionName).find(
    //     {
    //         loc: {
    //             $geoWithin: {
    //                 $geometry: {
    //                     type: "Polygon",
    //                     coordinates: [
    //                         array
    //                     ],
    //                     crs: {
    //                         type: "name",
    //                         properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // ).toArray()
    // return result

    return  {
                loc: {
                    $geoWithin: {
                        $geometry: {
                            type: "Polygon",
                            coordinates: [
                                array
                            ],
                            crs: {
                                type: "name",
                                properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
                            }
                        }
                    }
                }
            }
}

async function geoWithinInCircle( radiusList) {
    //    console.log("into geo within ",point ,radius);
    //     const result =await getClient().db(this.dbName).collection(this.collectionName).find(
    //         { loc: { $geoWithin: { $center: [point, parseInt(radius)] } } }
    //     ).toArray()
    //     console.log("after geo",await result);
    //     return await result
    const allFilters = radiusList.map(({radius, point}) => ({ pos: { $geoWithin: { $center: [point, parseInt(radius)] } } }));
    return allFilters
}




// }

// async dropCollection(){
//     const result =await getClient().db(this.dbName).collection(this.collectionName).drop((err,delOK)=>{
//         if(err) throw err
//         if(delOK) console.log("collection deleted");
//     })
// }

module.exports = { geoWithinInCircle }