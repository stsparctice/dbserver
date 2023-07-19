const { getTableFromConfig } = require('../../modules/config/config')
const { convertToSqlCondition } = require('../../utils/convert_condition');
const viewConnectionsTables = (tableName, condition = {}, topn) => {
    try {
        console.log({ tableName });
        const myTable = getTableFromConfig(tableName)
        const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
        let columnsSelect = [{ tableName: myTable.MTDTable.name.name, columnsName: [...myTable.columns.map(({ sqlName }) => sqlName)] }];
        let join = `${myTable.MTDTable.name.sqlName} ${myTable.MTDTable.name.name}`;
        columns.forEach(column => {
            const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
            const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
            const thisTable = getTableFromConfig(tableToJoin);
            const alias = thisTable.MTDTable.name.name;
            columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [`${columnToJoin} AS FK_${column.name}_${columnToJoin}`, `${thisTable.MTDTable.defaultColumn} AS FK_${column.name}_${thisTable.MTDTable.defaultColumn}`] }];
            join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.name.name}.${column.sqlName}=${alias}.${columnToJoin}`;
        });
        if (Object.keys(condition).length > 0) {

            let conditionString = convertToSqlCondition(getAlias(tableName), condition);

            join = `${join} WHERE ${conditionString}`;
        }
        let select = ``;
        columnsSelect.forEach(cs => {
            cs.columnsName.forEach(cn => {
                select = `${select} ${cs.tableName}.${cn},`;
            })
        })
        select = select.slice(0, select.length - 1);
        return `USE ${SQL_DBNAME} SELECT TOP ${topn} ${select} FROM ${join}`;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const autoComplete = ({ tableName, columns, condition }) => {
    if (condition !== "AND 1=1") {
        condition += "AND" + condition
    }
}

module.exports = { viewConnectionsTables, autoComplete };