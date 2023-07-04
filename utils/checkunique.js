const { getAllSql } = require('../modules/read')
const uniquesConfig = require('../config/config-uniques.json')

async function uniqueValue(field) {
    try {
        let list = uniquesConfig.find(u => Object.keys(u.fields).find(f => f == field.table))
        if (!list) {
            return
        }
        for (let item in list.fields) {
            if ((await getAllSql({ tableName: item, condition: `${list.fields[item]}='${field.value}'` })).length > 0) {
                return false
            }
        }
        return true
    }
    catch (error) {
        throw error
    }
}

function checkDataIsUnique() {
    return async (req, res, next) => {
        let error
        for (let value of Object.keys(req.body.values)) {
            if (await uniqueValue({ table: req.body.tableName, name: value, value: req.body.values[value] }) == false) {
                error = { value }
            }
        }
        if (error) {
            res.status(409).send(`Value: ${req.body.values[error.value]} is exsist.`)
        }
        else {
            next()
        }
    }
}

module.exports = { checkDataIsUnique }
