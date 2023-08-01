const DBconfig = require('../../config/DBconfig.json')
const notifictaions = require('../../config/serverNotifictionsConfig.json');

async function getTableName(config = DBconfig) {
    let Tables = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Tables').list
    let tableNameAndDescription = []
    let tableName = [];
    let tableDescription = [];
    let name;
    let description;
    Tables.forEach(t => {
        name = Object.values(t.MTDTable.name)
        console.log({ name });
        tableName.push(name)
        console.log({ tableName });
        description = Object.values(t.MTDTable.description)
        console.log({ description });
        tableDescription.push(description)
        console.log({ tableDescription });

    })
    for (let i = 0; i < tableName.length; i++) {
        tableNameAndDescription.push([tableName[i], tableDescription[i]])
    }
    return tableNameAndDescription
}

function getColumns(tableName, config = DBconfig) {
    try {
        let tables;
        try {
            let sql = config.find(db => db.database == 'sql');
            tables = sql.dbobjects.find(obj => obj.type == 'Tables').list;
        }
        catch {
            let error = notifictaions.find(({ status }) => status === 500);
            error.description += '(check the config file).';
            throw error;
        }
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].MTDTable.name.sqlName == tableName) {
                return tables[i].columns
            }
        }
        let error = notifictaions.find(n => n.status == 512);
        error.description = `Table: ${tableName} does not exist.`;
        throw error;
    }
    catch (error) {
        throw error;
    }
}

async function getProcedures(config = DBconfig) {
    let procedures = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Procedures').list
    let proceduresNameAndDescription = []
    let proceduresName = [];
    let proceduresDescription = [];
    let name;
    let description;
    procedures.forEach(t => {
        name = t.MTDProcedure.name;
        proceduresName.push(name)
        description = Object.values(t.MTDProcedure.description)
        proceduresDescription.push(description)
    })
    for (let i = 0; i < proceduresDescription.length; i++) {
        proceduresNameAndDescription.push([proceduresName[i], proceduresDescription[i]])
    }
    return proceduresNameAndDescription
}

async function getvalues(proceduresName, config = DBconfig) {
    let procedures = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Procedures').list
    for (let i = 0; i < procedures.length; i++) {
        if (Object.keys(procedures[i].MTDProcedure.name)[0] == Object.keys(proceduresName[0])[0]) {
            return procedures[i].values
        }
    }
}


module.exports = { getTableName, getColumns, getProcedures, getvalues };
