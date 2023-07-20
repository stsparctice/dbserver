const { getAllSql } = require('../modules/read')
const uniquesConfig = require('../config/config-uniques.json')
const notifications = require('../config/serverNotifictionsConfig.json')

async function uniqueValue(field) {
    try {
        let list = uniquesConfig.find(u => Object.keys(u.fields).find(f => f == field.table && u.fields[f] == field.name))
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
//האם בעדכון מקבלים את כל השדות או רק את מה שהתעדכן
function checkDataIsUnique() {
    return async (req, res, next) => {
        let error
        for (let value of Object.keys(req.body.values)) {
            let check = await uniqueValue({ table: req.body.tableName, name: value, value: req.body.values[value] })
            if (check == false) {
                error = { value }
            }
        }
        if (error) {
            let description = `Value: ${req.body.values[error.value]} is exsist.`
            error = notifications.find(n => n.status == 409)
            error.description = description
            res.status(error.status).send(error.description)
        }
        else {
            next()
        }
    }
}

module.exports = { checkDataIsUnique }
