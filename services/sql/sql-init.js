require('dotenv').config();
const path = require('path')
const { SQL_DBNAME } = process.env;
const { getPool } = require('./sql-connection');
const config = require('../../config.json');



function buildColumns(details) {
    console.log({details});
    let columns = '';
    for (let i = 0; i < details.length; i++) {
        columns += details[i].sqlName + ' ' + details[i].type + ', ';
        // console.log(details[i].sqlName);
    };
    columns = columns.substring(0, columns.length - 2);
    console.log({columns});
    return columns;
};

async function createTables() {

    _ = await getPool().request().query(`use master IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${SQL_DBNAME}') begin use master CREATE DATABASE [${SQL_DBNAME}]; end`);

    let tables = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == "Tables").list
    for (let j = 0; j < tables.length; j++) {
        let table = tables[j];
        console.log('finish');
        _ = await getPool().request().query(`use ${SQL_DBNAME} IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.MTDTable.name.sqlName}') CREATE TABLE [dbo].[${table.MTDTable.name.sqlName}](
            ${buildColumns(table.columns)}
            )
            `);
    };
    _ = await createNormalizationTable();


};


async function createNormalizationTable() {
    let tables = config.find(db => db.database == 'sql').dbobjects.find(obj => obj.type == "Tables").list

    for (let i = 0; i < tables.length; i++) {
        let tableName = tables[i].MTDTable.name.sqlName;
        for (let j = 0; j < tables[i].columns.length; j++) {
            let m = tables[i].columns[j];
            if (Object.keys(m).includes('values')) {
<<<<<<< HEAD
                let values = tables[i].columns.filter(v => Object.keys(v).includes("values"))
                if (!values[0].type.toUpperCase().includes('PRIMARY')) {
                    let values2 = values.map(f => f.values);
                    for (let y = 0; y < values2.length; y++) {
                        _ = await getPool().request().query(`
                        IF(SELECT COUNT(*)
                        FROM ${tableName})<${values2.length}
                        INSERT INTO ${tableName} VALUES (${values2[0][y]}, '${values2[1][y]}')
=======
                let values = table['columns'].filter(f => Object.keys(f).includes('values'));
                if (!values[0].type.type.toLowerCase().includes('PRIMARY'.toLowerCase())) {
                    let values2 = values.map(f => f['values']['values']);
                    for (let y = 0; y < values2[0].length; y++) {
                        console.log({name:name[0]});
                        console.log({v:values2});
                        console.log({v1:values2[0][y]});
                        console.log({v2:values2[1][y]});
                        _ = await getPool().request().query(`
                        use ${SQL_DBNAME}  IF(SELECT COUNT(*)
                        FROM ${name[0]})<${values2[0].length}
                        INSERT INTO ${name[0]} VALUES (${values2[0][y]}, N'${values2[1][y]}')
>>>>>>> e9189be1b98044f72865270526ba1bd1cb94038f
                    `);
                    };
                    break;
                }
                else {
                    let insertvals = values[1].values
                    for (let y = 0; y < insertvals.length; y++) {
                        _ = await getPool().request().query(`
<<<<<<< HEAD
                        IF(SELECT COUNT(*)
                        FROM ${tableName})<${insertvals.length}
                        INSERT INTO ${tableName} VALUES ( '${insertvals[y]}')
=======
                        use ${SQL_DBNAME}  IF(SELECT COUNT(*)
                        FROM ${name[0]})<${insertvals.length}
                        INSERT INTO ${name[0]} VALUES ( N'${insertvals[y]}')
>>>>>>> e9189be1b98044f72865270526ba1bd1cb94038f
                    `);
                    };
                    break;
                }
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

    SET @COMMAND = 'use ${SQL_DBNAME} INSERT INTO ' +
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
    SET @COMMAND = 'use ${SQL_DBNAME} SELECT TOP '+ @n + @columns +
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
    SET @COMMAND = 'use ${SQL_DBNAME} SELECT *  
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
        'use ${SQL_DBNAME} UPDATE ' +  @tableName +
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
		@SupplierCode NVARCHAR(30)
    AS
    BEGIN
    BEGIN TRAN

    UPDATE  tbl_Suppliers 
    SET DisableUser = @name,
		Disabled = '1',
		DisabledDate = GETDATE()
    WHERE SupplierCode = @SupplierCode   

    UPDATE tbl_Branches
    SET DisableUser = @name,
		Disabled ='1',
		DisabledDate = GETDATE()
	WHERE SupplierCode = @id

    COMMIT
    END
    `);

    _ = await getPool().request().query(`
   CREATE OR ALTER  PROCEDURE pro_CountRows
    @tableName NVARCHAR(20) , 
    @condition NVARCHAR(MAX)
        AS
        DECLARE @COMMAND NVARCHAR(4000) 
        BEGIN
        SET @COMMAND = 
            'use ${SQL_DBNAME}  SELECT COUNT(*) FROM ' + @tableName +
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
