
const path = require('path')
const { readAll, create } = require('../sql/sql-operations')
const { findSubDirectoriesSync } = require('../files/readFiles')
const { getSqlTableColumnsType, parseColumnSQLType } = require('../../modules/config/config-sql');
const productTables = ["BuytonGrain", "BuytonItems", "BuytonSomech", "BuytonStrength", "BuytonDegree"]

async function insertDataToSql() {
    try {
        for (let i = 0; i < productTables.length; i++) {
            let ans = await readAll({ tableName: `tbl_${productTables[i]}` })
            if (!ans || ans.length === 0) {
                const productData = findSubDirectoriesSync(path.join(__dirname, `../../files/${productTables[i]}.csv`))
                let tabledata = getSqlTableColumnsType(`tbl_${productTables[i]}`)
                for (let item of productData) {
                    let arr = parseColumnSQLType(item, tabledata)
                    arr = arr.join()
                    const obj = { tableName: `tbl_${productTables[i]}`, columns: (Object.keys(item).join()).trim(), values: arr }
                    await create(obj)
                }
            }
        }
    }
    catch (error) {
        throw error
    }
}


module.exports = { insertDataToSql }