//module
async function searchPointIntoArea(data, point) {
    if (data[0].areas[0].location != undefined) {
        //point and radius
        const result = await mongo_collection_geo.geoWithinInCircle(data[0].areas[0].location.coordinates, data[0].areas[0].radius)
        console.log("result in circle", result);

        if (result.length > 0) {
            return true
        }
        else {
            return false
        }
    }
    else {
        //polygon
        const result = await mongo_collection_geo.geoWithInPolygon(data[0].areas[0].coordinates)
        console.log("result in polygon", result);

        if (result.length > 0) {
            console.log("good!!!!!!!!!!");
            return true
        }
        else {
            console.log("bad!!!!!!!!!!");
            return false
        }
    }
}
async function dropCollectionGeoAftrFind() {
    const result = await mongo_collection_geo.dropCollection()
}
async function insertPointForGeo(point) {
    const result = await mongo_collection_geo.insertOne({ "loc": point })
}


//mongo operation
// async geoWithInPolygon(array, collectionName) {

//     const result = await getClient().db(this.dbName).collection(this.collectionName).find(
//         {
//             loc: {
//                 $geoWithin: {
//                     $geometry: {
//                         type: "Polygon",
//                         coordinates: [
//                             array
//                         ],
//                         crs: {
//                             type: "name",
//                             properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
//                         }
//                     }
//                 }
//             }
//         }
//     ).toArray()
//     return result
// }

// async geoWithinInCircle(point, radius, collectionName) {
//    console.log("into geo within ",point ,radius);
//     const result =await getClient().db(this.dbName).collection(this.collectionName).find(
//         { loc: { $geoWithin: { $center: [point, parseInt(radius)] } } }
//     ).toArray()
//     console.log("after geo",await result);
//     return await result
    

    

// }

// async dropCollection(){
//     const result =await getClient().db(this.dbName).collection(this.collectionName).drop((err,delOK)=>{
//         if(err) throw err
//         if(delOK) console.log("collection deleted");
//     })
// }