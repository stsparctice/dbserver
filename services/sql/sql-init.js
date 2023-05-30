require('dotenv').config();
const path = require('path')
const { SQL_DBNAME } = process.env;
const { getPool } = require('./sql-connection');
const config = require('../../config.json');

const { readAll, create } = require('./sql-operations')
const { findSubDirectoriesSync } = require('../readFiles')
const { getSqlTableColumnsType, parseSQLType } = require('../../modules/config');
const productTables = ["BuytonGrain", "BuytonItems", "SomechBuyton", "BuytonStrength", "BuytonDegree"]

function buildColumns(details) {
    let columns = '';
    for (let i = 0; i < details.length; i++) {
        columns += Object.values(details[i]['name']) + ' ' + Object.values(details[i]['type']) + ', ';
    };
    columns = columns.substring(0, columns.length - 2);
    return columns;
};

async function createTables() {

    _ = await getPool().request().query(`IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${SQL_DBNAME}') CREATE DATABASE [${SQL_DBNAME}];`);

    for (let j = 0; j < (config[0]['sql'][1]['Tables']).length; j++) {
        let table = config[0]['sql'][1]['Tables'][j];
        _ = await getPool().request().query(`IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${Object.values(table['MTDTable']['name'])}') CREATE TABLE [dbo].[${Object.values(table['MTDTable']['name'])}](
            ${buildColumns(table['columns'])}
            )
            `);
    };
    _ = await createNormalizationTable();
    insertDataToSql()

};

async function insertDataToSql() {

    for (let i = 0; i < productTables.length; i++) {
        let ans = await readAll({ tableName: `tbl_${productTables[i]}` })
        console.log({ ans })
        if (!ans) {
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
async function createNormalizationTable() {
    for (let i = 0; i < config[0]['sql'][1]['Tables'].length; i++) {
        let table = config[0]['sql'][1]['Tables'][i];
        let tableName = config[0]['sql'][1]['Tables'][i]['MTDTable']['name'];
        let name = Object.values(tableName);
        for (let j = 0; j < table['columns'].length; j++) {
            let m = table['columns'][j];
            if (Object.keys(m).includes('values')) {
                let values = table['columns'].filter(f => Object.keys(f).includes('values'));
                let values2 = values.map(f => f['values']['values']);
                for (let y = 0; y < values2[0].length; y++) {
                    _ = await getPool().request().query(`
                        IF(SELECT COUNT(*)
                        FROM ${name[0]})<${values2[0].length}
                        INSERT INTO ${name[0]} VALUES (${values2[0][y]}, '${values2[1][y]}')
                    `);
                };
                break;
            };
        };
    };
};

async function createProcedures() {
    _ = await getPool().request().query(`
    CREATE OR ALTER PROCEDURE pro_BasicCreate
	    @tableName NVARCHAR (20),
        @columns NVARCHAR (MAX),
	    @values NVARCHAR (MAX)
    AS
    DECLARE @COMMAND NVARCHAR(4000) 
    BEGIN

    SET @COMMAND = 'INSERT INTO ' +
        @tableName + ' ('+ @columns +')'+ 
        ' VALUES(' + @values + ')'
    EXEC (@COMMAND)
    END
    `.trim());

    _ = await getPool().request().query(`
    CREATE OR ALTER PROCEDURE pro_BasicRead
    @TableName NVARCHAR(30),
    @columns NVARCHAR(MAX),
    @condition NVARCHAR(MAX),
    @n NVARCHAR(200)
    AS
    BEGIN
    DECLARE @COMMAND nvarchar(100)
    SET @COMMAND = 'SELECT TOP '+ @n + @columns +
        ' FROM ' + @TableName +
        ' WHERE ' + @condition
            
    EXEC(@COMMAND)
    END
    `);

    _ = await getPool().request().query(`
    CREATE OR ALTER PROCEDURE pro_ReadAll
    @TableName NVARCHAR(30),
    @condition NVARCHAR(MAX)
    AS
    BEGIN
    DECLARE @COMMAND nvarchar(4000)
    SET @COMMAND = 'SELECT *  
        FROM ' + @TableName +
        ' WHERE ' + @condition
    EXEC(@COMMAND)
    END
    `);

    _ = await getPool().request().query(`
    CREATE OR ALTER PROCEDURE pro_BasicUpdate
        @tableName NVARCHAR(20) , 
        @values NVARCHAR(MAX),
        @condition NVARCHAR(MAX)
    AS
    DECLARE @COMMAND NVARCHAR(4000) 
    BEGIN
    SET @COMMAND = 
        'UPDATE ' +  @tableName +
        ' SET ' + @values + 
        ' WHERE ' + @condition

    EXEC(@COMMAND)
    END
    `);
};

async function createSpecialProcedures() {
    _ = await getPool().request().query(`
    CREATE OR ALTER PROCEDURE pro_UpdateQuotation
        @serialNumber int
    AS
    BEGIN
    BEGIN TRAN
    
    UPDATE  tbl_Quotation 
    SET disabled= 1
    WHERE serialNumber=@serialNumber
    
    UPDATE tbl_QuotationItems
    SET disabled= 1
    WHERE quotationCode=@serialNumber
    
    COMMIT
    END
    `);

    _ = await getPool().request().query(`
    CREATE OR ALTER PROCEDURE pro_UpdateSuppliersBranches
        @name NVARCHAR(30),
        @id INT,
		@supplierCode NVARCHAR(30)
    AS
    BEGIN
    BEGIN TRAN

    UPDATE  tbl_Suppliers 
    SET DisableUser = @name,
		Disabled = '1',
		DisabledDate = GETDATE()
    WHERE SupplierCode = @supplierCode

    UPDATE tbl_Branches
    SET DisableUser = @name,
		Disabled ='1',
		DisabledDate = GETDATE()
	WHERE SupplierCode = @id

    COMMIT
    END
    `);

    _ = await getPool().request().query(`
    CREATE OR ALTER PROCEDURE pro_CountRows
    @tableName NVARCHAR(20) , 
    @condition NVARCHAR(MAX)
        AS
        DECLARE @COMMAND NVARCHAR(4000) 
        BEGIN
        SET @COMMAND = 
            'SELECT COUNT(*) FROM ' + @tableName +
            ' WHERE ' + @condition

        EXEC(@COMMAND)
    END
`);
}


module.exports = {
    createTables,
    createProcedures,
    createSpecialProcedures
};
