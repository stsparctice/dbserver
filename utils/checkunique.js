const { getAllSql } = require('../modules/read')
const uniquesConfig = require('../config/config-uniques.json')

async function uniqueValue(field) {
    try {
        let list = uniquesConfig.find(u => Object.keys(u.fields).find(f => f == field.table && u.fields[f] == field.name))
        console.log({ list });
        if (!list || (list.allowNulls == true && field.value == null)) {
            return
        }
        for (let item in list.fields) {
            let sameValues = await getAllSql({ tableName: item, condition: `${list.fields[item]}='${field.value}'` })
            if (sameValues.length > 0) {
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
            console.log({ value });
            let check = await uniqueValue({ table: req.body.tableName, name: value, value: req.body.values[value] })
            if (check == false) {
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
