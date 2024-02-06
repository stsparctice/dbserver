
const path = require('path')
const { readAll, create } = require('../sql/sql-operations')
const { findSubDirectoriesSync } = require('../files/readFiles')
const { getSqlTableColumnsType, parseColumnSQLType } = require('../../modules/config/config-sql');
const { createQuery } = require('../sql/sql-queries');
const productTables = [{ file: "BuytonGrain", table: "CementGrain" },

{ file: "BuytonSomech", table: "CementSomech" },
{ file: "BuytonStrength", table: "CementStrength" },
{ file: "BuytonDegree", table: "CementDegree" },
{ file: "BuytonItems", table: "BasicItems" },]

async function insertDataToSql() {
    try {
        for (let i = 0; i < productTables.length; i++) {
            let ans = await readAll({ tableName: `tbl_${productTables[i].table}` })
            if (!ans || ans.length === 0) {
                const productData = findSubDirectoriesSync(path.join(__dirname, `../../files/${productTables[i].file}.csv`))
                let tabledata = getSqlTableColumnsType(`tbl_${productTables[i].table}`)
                for (let item of productData) {
                    let arr = parseColumnSQLType(item, tabledata)
                    arr = arr.join()
                    const obj = { tableName: `tbl_${productTables[i].table}`, columns: (Object.keys(item).join()).trim(), values: arr }
                    const query = createQuery( `tbl_${productTables[i].table}`, (Object.keys(item).join()).trim(),  arr)
                    await create(query)
                }
            }
        }
    }
    catch (error) {
        throw error
    }
}


module.exports = { insertDataToSql }