require('dotenv').config();

const { getPool, newTransaction } = require('./sql-connection');
const { SQL_DBNAME } = process.env;
const { DBType } = require('../../utils/types')
const { getPrimaryKeyField,
     getTableFromConfig,
     parseColumnSQLType,
     getTableAlias,
     parseOneColumnSQLType,
     getSqlTableColumnsType,
     parseColumnName } = require('../../modules/config/config-sql')
const notifications = require('../../config/serverNotifictionsConfig.json');
const { getConverter } = require('./sql-convert-query-to-condition');

const { updateQuery } = require('./sql-queries');

const sqlKeyTypes = {
     PRIMARY_KEY: 'PRIMARY KEY',
     FOREIGN_KEY: 'FOREIGN KEY',
     UNIQUE: 'UNIQUE'
}
// if (!SQL_DBNAME) {
//      throw notifications.find(n => n.status == 509)
// }

const create = async function (obj) {
     const { tableName, columns, values } = obj;
     try {
          const primarykey = getPrimaryKeyField(tableName)
          console.log(`use ${SQL_DBNAME} INSERT INTO ${tableName} (${columns}) VALUES(${values}) SELECT @@IDENTITY ${primarykey}`);
          const result = await getPool().request().query(`use ${SQL_DBNAME} INSERT INTO ${tableName} (${columns}) VALUES(${values}) SELECT @@IDENTITY ${primarykey}`)

          return result.recordset;
     }

     catch (error) {
          throw error
     }

}

const read = async function (obj) {
     console.log({ read: obj })

     try {
          if (!Object.keys(obj).includes("condition")) {
               obj.condition = '1=1';
          };
          if (!Object.keys(obj).includes("n")) {
               obj.n = 100;
          }
          let { tableName, columns, condition, n } = obj;
          if (columns === undefined) {
               columns = '*'
          }
          const convert = getConverter(tableName)
          condition = convert.convertCondition(condition)
          console.log(`USE ${SQL_DBNAME} SELECT TOP ${n} ${columns} FROM ${tableName} AS ${getTableAlias(tableName)} where ${condition}`);
          const result = await getPool().request().query(`USE ${SQL_DBNAME} SELECT TOP ${n} ${columns} FROM ${tableName} AS ${getTableAlias(tableName)} WHERE ${condition}`);
          return result.recordset;
     }
     catch (error) {
          console.log({ error });
          throw notifications.find(({ status }) => status == 400);
     }
};
const readAll = async function (obj) {
     try {
          if (!Object.keys(obj).includes("condition")) {
               obj["condition"] = '1=1';
          };
          const { tableName, condition } = obj;
          const readQuery = `use ${SQL_DBNAME} select * from ${tableName} as ${getTableFromConfig(tableName).MTDTable.name.name} where ${condition}`
          const result = await getPool().request().query(readQuery)
          return result.recordset;
     }
     catch (error) {
          console.log(error.message)
          throw error
     }
};

const sqlTransaction = async function (queries) {
     try {
          // let connectionPool = new sql.ConnectionPool(poolConfig());
          // await connectionPool.connect();
          // const transaction = new sql.Transaction(connectionPool);
          const { statement, transaction } = await newTransaction()
          try {
               await transaction.begin();
               for (const command of queries) {
                    await statement.prepare(command)
                    try {
                         await statement.execute()
                    }
                    finally {
                         await statement.unprepare()
                    }
               }
               await transaction.commit();

          } catch (error) {
               console.log({ error });
               await transaction.rollback();
          }
          return true
     }
     catch (error) {
          console.log({ error });
          throw error
     }
};

const transaction = async (data) => {
     const { statement, transaction } = await newTransaction()
     // statement.input('db', mssql.NVarChar(50))
     try {
          await transaction.begin()

          for (let record of data) {
               let dbObject = parseDBname(record.entityName)
               let { type, entityName } = dbObject
               if (type === DBType.SQL) {
                    let tabledata = getSqlTableColumnsType(entityName)
                    let primarykey = getPrimaryKeyField(entityName)
                    record.values = record.values.map(obj => parseColumnName(obj, entityName).sqlValues)

                    for (let iterator of record.values) {
                         let arr = parseColumnSQLType(iterator, tabledata)
                         try {
                              console.log(`USE ${SQL_DBNAME} INSERT INTO ${entityName} (${Object.keys(iterator).join()}) VALUES(${arr.join()}) SELECT @@IDENTITY ${primarykey}`);
                              await statement.prepare(`USE ${SQL_DBNAME} INSERT INTO ${entityName} (${Object.keys(iterator).join()}) VALUES(${arr.join()}) SELECT @@IDENTITY ${primarykey}`)
                              await statement.execute()
                              await statement.unprepare();
                         }
                         finally {
                              await statement.unprepare();
                         }
                    }
                    // console.log(transaction);
               }
               await transaction.commit()


               if (type === DBType.MONGO) {

               }
          }

     }
     catch (error) {
          await transaction.rollback();
          result = []
     }
     console.log(result);

}

const join = async (query = "") => {
     try {
          // console.log('join')
          console.log({ query })
          const result = await getPool().request().query(query.trim());
          console.log(result.recordset)
          if (result.recordset) {
               return result.recordset;
          }
          return false;
     }
     catch (error) {
          console.log({ error })
          throw error
     }
};
const update = async function (obj) {
     try {
          const query = updateQuery(obj)
          console.log({ query })
          const result = await getPool().request().query(query)
          return result;
     }
     catch (error) {
          console.log(error)
          throw error
     }
};

const deleteItem = async (obj) => {
     try {
          const convert = getConverter(getTableFromConfig(obj.entityName))
          obj.condition = convert.convertCondition(obj.condition)
          const alias = getTableFromConfig(obj.entityName).MTDTable.name.name
          const tableData = getSqlTableColumnsType(obj.entityName)
          const updateValues = valEntries.map(c => `${alias}.${c[0]} =  ${parseOneColumnSQLType({ name: c[0], value: c[1] }, tableData)}`).join(',')
          console.log(`use ${SQL_DBNAME} UPDATE ${alias} SET ${updateValues} FROM ${obj.entityName} ${alias} WHERE ${obj.condition}`)
          const result = await getPool().request().query(`use ${SQL_DBNAME} UPDATE ${alias} SET ${updateValues} FROM ${obj.entityName} ${alias} WHERE ${obj.condition}`)
          return result;
     }
     catch (error) {
          console.log(error)
          throw error
     }
}

const countRows = async function (obj) {
     try {
          const { tableName, condition } = obj;
          console.log({ func: 'countRows', tableName, condition })
          const result = await getPool().request().query(`use ${SQL_DBNAME} SELECT COUNT(*) as countRows FROM ${tableName} as ${getTableFromConfig(tableName).MTDTable.name.name} WHERE ${condition}`)
          return result;
     }
     catch (error) {
          throw error
     }
}
const getSqlColumns = async function (database, tablename) {
     try {
          const response = await getPool().request().query(`USE master  SELECT COLUMN_NAME name,DATA_TYPE type, CHARACTER_MAXIMUM_LENGTH max, IS_NULLABLE isnull from ${database}.[INFORMATION_SCHEMA].[COLUMNS]  WHERE TABLE_NAME = N'${tablename}'`)
          return response.recordset
     }
     catch (error) {
          throw error
     }
}

const getTableKeys = async function (database, tablename, key) {
     try {
          const response = await getPool().request().query(`USE master  SELECT  keys.COLUMN_NAME name , constrains.CONSTRAINT_TYPE  type 
     FROM ${database}.INFORMATION_SCHEMA.TABLE_CONSTRAINTS  constrains 
     INNER JOIN ${database}.INFORMATION_SCHEMA.KEY_COLUMN_USAGE  keys
     ON keys.CONSTRAINT_NAME = constrains.CONSTRAINT_NAME
     WHERE keys.TABLE_NAME = '${tablename}' AND CONSTRAINT_TYPE = '${key}'`)
          return response.recordset
     }
     catch (error) {
          throw error
     }
}

const getIdentityColumns = async function (database, tablename) {
     try {
          const response = await getPool().request().query(`use master select columns.name
                                                            from ${database}.sys.columns columns
                                                            join  ${database}.sys.objects objects on columns.object_id = objects.object_id
                                                            join  ${database}.sys.schemas s on s.schema_id = objects.schema_id
                                                            where s.name = 'dbo'
                                                            and objects.is_ms_shipped = 0 and objects.type = 'U'
                                                            and columns.is_identity = 1
                                                            and objects.name = '${tablename}' `)
          return response.recordset
     }
     catch (error) {
          throw error
     }
}

const getForeignKeysData = async function (database, tablename) {
     try {
          const response = await getPool().request().query(`use master  SELECT  
                                                    col1.name AS [column],
                                                    tab2.name AS [ref_table],
                                                    col2.name AS [ref_column]
                                                    FROM  ${database}.sys.foreign_key_columns fkc
                                                    INNER JOIN  ${database}.sys.objects obj
                                                    ON obj.object_id = fkc.constraint_object_id
                                                    INNER JOIN  ${database}.sys.tables tab1
                                                    ON tab1.object_id = fkc.parent_object_id
                                                    INNER JOIN  ${database}.sys.schemas sch
                                                    ON tab1.schema_id = sch.schema_id
                                                    INNER JOIN  ${database}.sys.columns col1
                                                    ON col1.column_id = parent_column_id AND col1.object_id = tab1.object_id
                                                    INNER JOIN  ${database}.sys.tables tab2
                                                    ON tab2.object_id = fkc.referenced_object_id
                                                    INNER JOIN  ${database}.sys.columns col2
                                                    ON col2.column_id = referenced_column_id AND col2.object_id = tab2.object_id
	                                                WHERE tab1.name  = N'${tablename}'`)
          return response.recordset
     }
     catch (error) {
          throw error
     }
}


async function drop(tableName) {
     _ = await getPool().request().query(`use ${SQL_DBNAME}
     DROP TABLE ${tableName}`);
     console.log('delete tbl in sql');
}
async function updateColumn(obj) {
     console.log('update column');
     _ = await getPool().request().query(`use ${SQL_DBNAME}
     UPDATE ${obj.table}
     SET ${obj.column} = 1000`);
}
module.exports = {
     sqlKeyTypes,
     create,
     read,
     readAll,
     update,
     countRows,
     join,
     getTableKeys,
     getIdentityColumns,
     getForeignKeysData,
     getSqlColumns,
     drop,
     updateColumn,
     sqlTransaction
}
