const types = require('./config/config-objects')
const { getTableFromConfig, getCollectionsFromConfig } = require('./config/config')
const notifictaions = require('../config/serverNotifictionsConfig.json')

function checkEntityType(entityName) {
    let table = getTableFromConfig(entityName);
    console.log({ table });
    if (table) {
        return { entityName, type: 'SQL' }
    }
    let collection = getCollectionsFromConfig(entityName);
    if (collection) {
        return { entityName, type: 'mongoDB' };
    }
    else {
        let description = `the entityName : ${entityName} is not exist`
        let error = notifictaions.find(n => n.status === 516)
        error.description = description
        throw error;
    }
}

function getSqlTableColumnsType(tablename) {
    try {
        const table = getTableFromConfig(tablename)
        let col = table.columns.map(col => ({ sqlName: col.sqlName, type: col.type.trim().split(' ')[0] }))
        return col
    }
    catch (error) {
        throw error
    }
};

function parseSQLType(obj, tabledata) {
    try {
        const keys = Object.keys(obj)
        let str = []
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]] != null) {
                let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase()).type
                let parse
                try {
                    parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
                }
                catch {
                    let error = notifictaions.find(n => n.status == 513)
                    error.description = `Type: ${type} does not exist.`
                    throw error
                }
                console.log(obj[keys[i]]);
                const val = parse.parseNodeTypeToSqlType(obj[keys[i]]);
                str.push(val);
            }
            else {
                str.push('NULL')
            }
        }
        return str
    }
    catch (error) {
        if (error.status == 513) {
            throw error
        }
        throw notifictaions.find(n => n.status == 400)
    }
}

function parseSQLTypeForColumn(col, tableName) {
    const tabledata = getSqlTableColumnsType(tableName)
    let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == col.name.trim().toLowerCase()).type
    let parse
    try {
        parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
    }
    catch {
        let error = notifictaions.find(n => n.status == 513)
        error.description = `Type: ${type} does not exist.`
        throw error
    }
    const val = parse.parseNodeTypeToSqlType(col.value);
    return val
}

function buildSqlCondition(tableName, condition) {
    try {
        const tablealias = getTableFromConfig(tableName).MTDTable.name.name
        console.log({ tableName, condition })
        if (condition) {
            const entries = Object.entries(condition)
            const conditionList = entries.map(c =>
                `${tablealias}.${c[0]} =  ${parseSQLTypeForColumn({ name: c[0], value: c[1] }, tableName)}`
            )
            condition = conditionList.join(' AND ')
        }
        else {
            condition = "1 = 1"
        }
        return condition
    }
    catch (error) {
        throw error
    }
}



function getPrimaryKeyField(tablename) {
    try {

        let x = getTableFromConfig(tablename)
        let col = x.columns.find(col => (col.type.toLowerCase().indexOf('primary') !== -1))
        if (col) {
            return col.sqlName
        }
        return false
    }
    catch (error) {
        throw error
    }
}

function getReferencedColumns(tablename) {
    try {
        const table = getTableFromConfig(tablename)
        let columns = table.columns.filter(col => col.reference).map(col => ({ name: col.sqlName, ref: col.reference }))
        return columns
    } catch (error) {
        throw error
    }
}

function getObjectWithFeildNameForPrimaryKey(tablename, fields, id) {
    try {

        let primarykey = getPrimaryKeyField(tablename)
        if (primarykey) {
            let where = {}
            where[primarykey] = id
            return { tablename, columns: fields, where }
        }
        return false
    }
    catch (error) {
        throw error
    }
}

function getForeignTableAndColumn(tablename, field) {
    try {

        const table = getTableFromConfig(tablename)
        if (table) {
            let foreignTableName
            try {

                const column = table.columns.find(c => c.name.toLowerCase() == field.toLowerCase())
                const { type } = column;
                foreignTableName = type.toUpperCase().split(' ').find(w => w.includes('TBL_'))
                let index = foreignTableName.indexOf('(')
                foreignTableName = foreignTableName.slice(0, index)
            }
            catch {
                let error = notifictaions.find(n => n.status == 515)
                error.description = `Field: ${field} is not exsist in table: ${tablename}.`
                throw error
            }
            const foreignTable = getTableFromConfig(foreignTableName)

            const { defaultColumn } = foreignTable.MTDTable
            return { foreignTableName, defaultColumn }

        }
        return false
    }
    catch (error) {
        throw error
    }
}

function convertFieldType(tablename, field, value) {
    try {

        const columns = getSqlTableColumnsType(tablename)
        let col = columns.find(c => c.sqlName === field)
        let parse = types[col.type.toUpperCase().replace(col.type.slice(col.type.indexOf('('), col.type.indexOf(')') + 1), '')]
        const ans = parse.parseNodeTypeToSqlType(value)
        return ans
    }
    catch (error) {
        const e = notifictaions.find(({ status }) => status === 513);
        e.description = error.message;
        throw e;
    }

}
const getAlias = (tableName) => {
    const tablealias = getTableFromConfig(tableName).MTDTable.name.name;
    return tablealias;
}

module.exports = {
    getSqlTableColumnsType,
    buildSqlCondition,
    parseSQLType,
    parseSQLTypeForColumn,
    getReferencedColumns,
    convertFieldType,
    getPrimaryKeyField,
    getAlias,
    getObjectWithFeildNameForPrimaryKey,
    getForeignTableAndColumn,
    checkEntityType
}
