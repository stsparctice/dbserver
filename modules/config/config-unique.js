const uniqueConfig = require('../../config/config-uniques.json')

function getAllUniqueGroupsForTable(tablename) {
    const uniques = uniqueConfig.filter(({ fields }) => fields.find(({ table }) => table === tablename))
    console.log({uniques});
    return uniques
}

module.exports = { getAllUniqueGroupsForTable }