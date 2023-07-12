const convertToSqlQuery = (condition) => {

}
const convertToMongoFilter = (condition) => {
        let subFilter = {}
        for (let key in condition) {
            if (condition[key] instanceof Array) {
                subFilter[`$${key.toLowerCase()}`] = condition[key].map(o => convertToMongoFilter(o))
            }
            else {
                subFilter[key] = condition[key]
            }
        }
        return subFilter
}

module.exports = { convertToMongoFilter, convertToSqlQuery }
