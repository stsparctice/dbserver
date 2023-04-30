require('dotenv').config();
const { SQL_DBNAME } = process.env;
const { getPool } = require('./sql-connection')
const config = require('../../config.json')

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

};

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
};

module.exports = { createTables, createProcedure };
