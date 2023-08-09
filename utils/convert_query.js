const removeIndexes = (str) => {
    const splitIndex = str.lastIndexOf('_')
    if (splitIndex !== -1) {
        str = str.slice(0, splitIndex)
    }
    return str;
}
//     //  {"condition":{"LIKE":[{"OrdererName":"*37"},{"OrdererName":"י"},{"OrdererName":"*37"}]}}
//     // {condition:{"AND":[{racheli:1},{michali:2},OR:[{sarit:5},{bilha:25},{BETWEEN:{michal:5,michal:25}}]],"LIKE":[{miri:('%').charCodeAt()},{miri:"א"}]}}
//     // and the simple condition doesnt work - condition:{"miri": "x"}
const buildQueryObject = (arr, start, obj) => {
    for (let i = start; i < arr.length; i++) {
        for (const key in arr[i]) {
            const realKey = removeIndexes(key)
            switch (realKey) {
                case 'start':
                    obj = {}
                    console.log({ arr: arr[i][key] })
                    obj[arr[i][key]] = buildQueryObject(arr, i + 1, [])
                    console.log({ obj })
                    return obj
                case 'end':
                    return obj;
                default:
                    let newobj = {}
                    newobj[removeIndexes(key)] = arr[i][key]
                    obj = [...obj, newobj]
                    break;
            }
        }
    }
    return obj

}

const convertQueryToObject = (query) => {
    const queryArray = Object.entries(query).reduce((arr, entry) => arr = [...arr, Object.fromEntries([entry])], [])
    let queryMap = buildQueryObject(queryArray, 0, [])
    if (queryMap.length > 0) {
        queryMap = queryMap.reduce((reduceObj, q) => {
            let key = Object.keys(q)
            let obj = {}
            obj[key] = q[key]
            return { ...reduceObj, ...obj }
        }, {})
    }
    return queryMap
}




module.exports = {   convertQueryToObject }
