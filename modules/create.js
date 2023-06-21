const { create, createNewTable, insertColumn } = require('../services/sql/sql-operations');
// const { checkObjCreate } = require('./check')
const MongoDBOperations = require('../services/mongoDB/mongo-operations');
const mongoCollection = MongoDBOperations;

const { getSqlTableColumnsType, parseSQLType } = require('../modules/config/config')

async function createSql(obj) {
    let tabledata = getSqlTableColumnsType(obj.tableName)
    let arr = parseSQLType(obj.values, tabledata)
    
    console.log({obj})
    const result = await create({tableName:obj.tableName, columns: (Object.keys(obj.values).join()).trim(), values:arr.join()});
    // console.log("result: "+result);
    
    return result;
};



async function insertManySql(obj) {
    let tabledata
    let arr
    let values = obj.values

    let result = []
    for (let o of values) {
        tabledata = getSqlTableColumnsType(obj.tableName)
        arr = parseSQLType(o, tabledata);
        let res = await create({ tableName: obj.tableName, columns: (Object.keys(o).join()).trim(), values: arr.join() });
        result = [...result, res.recordset[0]]
    }
    if (result)
        return result;
    else
        return false;

}


// {
//     "MTDTable": {
//         "name": {
//             "name": "unitOfMeasure",
//             "sqlName": "tbl_unitOfMeasure"
//         },
//         "description": "a normalization table of unitsOfMeasure"
//     },
//     "columns": [
//         {
//             "name": "id",
//             "type": "INT IDENTITY PRIMARY KEY NOT NULL"
//         },
//         {
//             "name": "measure",
//             "type": "NVARCHAR(20) NOT NULL "
//         }
//     ]
// },

async function creatNewColumn(obj) {
    try {
        const result = await insertColumn(obj)
        return result
    } catch (error) {
        console.log("error modul");
        throw error
    }
}

async function creatSqlTable(obj) {
    console.log("creatSqlTable module");
    console.log(creatSqlNameTable(obj.MTDTable.name.name), "upper case");
    try {
        console.log(obj);
        // (creatSqlNameTable(req.body.MTDTable.name) ,"upper case" );
        // obj.MTDTable.name.sqlName=await creatSqlNameTable(obj.MTDTable.name.name)
        // console.log(obj.MTDTable.name.sqlName,  "  sqlName");
        const result = await createNewTable(obj)
        return result
    } catch (error) {
        throw error
    }
}


async function creatSqlNameColumn(str) {
    return str.replace(str.charAt(0), str.charAt(0).toUpperCase())
}

async function creatSqlNameTable(str) {
    return `tbl_${str.replace(str.charAt(0), str.charAt(0).toUpperCase())}`
}


async function createMng(obj) {
    mongoCollection.setCollection(obj.collection);
    const response = await mongoCollection.insertOne(obj.data);
    return response;
};

module.exports = { createSql, createMng, creatSqlTable, creatNewColumn, creatSqlNameTable, creatSqlNameColumn,insertManySql };
