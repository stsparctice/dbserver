require('dotenv').config();
const { findSubDirectoriesSync } = require('../readFiles')
const { SQL_DBNAME } = process.env;
const { getPool } = require('./sql-connection')
const { create } = require('../sql/sql-operations')
const config = require('../../config.json')
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
    let flag = false;
    const result = await getPool().request()
        .input('tableName', 'tbl_BuytonGrain')
        .execute(`pro_checkTableIsExist`);
    if (result.returnValue == 0) {
        flag = true;
    }

    _ = await getPool().request().query(`IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${SQL_DBNAME}') CREATE DATABASE [${SQL_DBNAME}];`);

    for (let j = 0; j < (config[0]['sql'][1]['Tables']).length; j++) {
        let table = config[0]['sql'][1]['Tables'][j];
        _ = await getPool().request().query(`IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${Object.values(table['MTDTable']['name'])}') CREATE TABLE [dbo].[${Object.values(table['MTDTable']['name'])}](
            ${buildColumns(table['columns'])}
        )
        `);
    };

    if (flag)
        insertDataToSql()

};

async function insertDataToSql() {
    console.log("in");

    for (let i = 0; i < productTables.length; i++) {
        const productData = await findSubDirectoriesSync(`U:/welcome to the project/קבצים למילוי טבלאות מוצרים/טבלאות ב-CSV/${productTables[i]}.csv`)
        productData.forEach(p => {
            const obj = { tableName: `tbl_${productTables[i]}`, values: p }
            create(obj)
        })
    }
}


async function createProcedure() {
    _ = await getPool().request().query(`(
    CREATE PROCEDURE pro_BasicCreate
	    @tableName NVARCHAR (20),
	    @values NVARCHAR (200)
    AS
    DECLARE @COMMAND NVARCHAR(4000) 
    BEGIN

    SET @COMMAND = 'INSERT INTO ' +
        @tableName + 
        ' VALUES(' + @values + ')'
    EXEC (@COMMAND)
    END
`);
    _ = await getPool().request().query(`(
    CREATE PROCEDURE pro_BasicRead
        @TableName NVARCHAR(30),
        @columns NVARCHAR(MAX),
        @condition NVARCHAR(MAX)
    AS
    BEGIN
    DECLARE @COMMAND nvarchar(100)
    SET @COMMAND = 'SELECT TOP 20' + @columns +
        ' FROM ' + @TableName +
        ' WHERE ' + @condition
            
    EXEC(@COMMAND)
    END   
    `);
    _ = await getPool().request().query(`(
    CREATE PROCEDURE pro_BasicUpdate
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

    _ = await getPool().request().query(`(
    CREATE OR ALTER PROCEDURE pro_checkTableIsExist
    @TableName NVARCHAR(30)
  AS
  BEGIN
  DECLARE @COMMAND bit
  IF NOT EXISTS(SELECT * FROM sys.tables WHERE name = @tableName)	
  SET @COMMAND = 0
  else
  set @COMMAND=1
   return @COMMAND
  END
  `);

};

module.exports = { createTables, createProcedure };
