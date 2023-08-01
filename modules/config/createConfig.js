const DBconfig = require('../../config/DBconfig.json')

async function getTableName(config=DBconfig) {
    let Tables = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Tables').list
    let tableNameAndDescription = []
    let tableName = [];
    let tableDescription = [];
    let name;
    let description;
    Tables.forEach(t => {
        name = Object.values(t.MTDTable.name)
        console.log({name});
        tableName.push(name)
        console.log({tableName});
        description = Object.values(t.MTDTable.description)
        console.log({description});
        tableDescription.push(description)
        console.log({tableDescription});

    })
    for (let i = 0; i < tableName.length; i++) {
        tableNameAndDescription.push([tableName[i], tableDescription[i]])
    }
    return tableNameAndDescription
}

async function getColumns(tableName, config=DBconfig) {
    let Tables = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Tables').list
    for (let i = 0; i < Tables.length; i++) {
        if (Tables[i].MTDTable.name.name == tableName[0][0]) {
            return Tables[i].columns
        }
    }
}

async function getProcedures(config=DBconfig) {
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

async function getvalues(proceduresName, config=DBconfig) {
    let procedures = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == 'Procedures').list
    for (let i = 0; i < procedures.length; i++) {
        if (Object.keys(procedures[i].MTDProcedure.name)[0] == Object.keys(proceduresName[0])[0]) {
            return procedures[i].values
        }
    }
}


module.exports = { getTableName, getColumns, getProcedures, getvalues };
