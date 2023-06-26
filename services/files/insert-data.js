
const path = require('path')
const { readAll, create } = require('../sql/sql-operations')
const { findSubDirectoriesSync } = require('../files/readFiles')
const { getSqlTableColumnsType, parseSQLType } = require('../../modules/config/config');
const productTables = ["BuytonGrain", "BuytonItems", "BuytonSomech", "BuytonStrength", "BuytonDegree"]

async function insertDataToSql() {

    for (let i = 0; i < productTables.length; i++) {
        let ans = await readAll({ tableName: `tbl_${productTables[i]}` })
        if (!ans || ans.length===0) {
            const productData = await findSubDirectoriesSync(path.join(__dirname, `../../files/${productTables[i]}.csv`))
            let tabledata = getSqlTableColumnsType(`tbl_${productTables[i]}`)

            for (let item of productData) {
                let arr = parseSQLType(item, tabledata)
                arr = arr.join()
                const obj = { tableName: `tbl_${productTables[i]}`, columns: (Object.keys(item).join()).trim(), values: arr }
                await create(obj)
            }
        }
    }
}


module.exports = {insertDataToSql}