const config = require('./TESTconfig/config.json');
const incorrectConfig = require('./TESTconfig/incorrectConfig.json');
const {
    getTableFromConfig,
    getSQLReferencedColumns,
    getTableAccordingToRef,
    getForeignTableDefaultColumn,
    getTableColumnsSQLName,
    getSqlTableColumnsType,
    getConnectedEntities,
    getInnerReferencedColumns
} = require('../../../modules/config/config-sql')

describe('TEST ON config.js FILE', () => {
    describe('GET TABLE FROM CONFIG', () => {
        it('The function received a table name and returns the table accordingly', () => {
            const result = getTableFromConfig('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual({
                "MTDTable": {
                    "name": {
                        "name": "example_table4",
                        "sqlName": "tbl_example_table4"
                    },
                    "description": "example table with values in columns",
                    "defaultColumn": "Name"
                },
                "columns": [
                    {
                        "name": "id",
                        "sqlName": "Id",
                        "type": {
                            "type": "INT",
                            "isnull": false
                        },
                        "primarykey": true,
                        "isIdentity": true
                    },
                    {
                        "name": "name",
                        "sqlName": "Name",
                        "type": {
                            "type": "NVARCHAR",
                            "max": 50,
                            "isnull": false
                        }
                    }
                ]
            });
        });
        it('The table name should be of type string', () => {
            expect(() => getTableFromConfig(15, config)).toThrow('Check the type of the parameter received');
            expect(() => getTableFromConfig('tbl_example_table4', config)).not.toThrow();
        });
        it('The value returned is of type object', () => {
            const result = getTableFromConfig('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Object);
        });
        it('When table name does not exist in the config the function returns an error accordingly', () => {
            expect(() => getTableFromConfig('table_not_exist', config)).toThrow('Check Table Name');
            expect(() => getTableFromConfig('tbl_example_table4', config)).not.toThrow();
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getTableFromConfig('tbl_example_table4', incorrectConfig)).toThrow('Check config file');
        });
    });

    // describe('GET COLLECTIONS FROM CONFIG', () => {
    //     it('A function received a collection name and returns the collection accordingly', () => {
    //         const result = getCollectionsFromConfig('example', config);
    //         expect(result).toBeDefined();
    //         expect(result).toStrictEqual({ 'mongoName': 'example', 'name': 'example' });
    //     });
    //     it('The value returned is of type object', () => {
    //         const result = getCollectionsFromConfig('example', config);
    //         expect(result).toBeDefined();
    //         expect(result).toBeInstanceOf(Object);
    //     });
    //     it('The collection name should be of type string', () => {
    //         expect(() => getCollectionsFromConfig(15, config)).toThrow('Check the type of the parameter received');
    //         expect(() => getCollectionsFromConfig('example', config)).not.toThrow();
    //     });
    //     it('Collection name does not exist returns an error accordingly', () => {
    //         expect(() => getCollectionsFromConfig('collection_not_exist', config)).toThrow('Check Collection Name');
    //         expect(() => getCollectionsFromConfig('example', config)).not.toThrow();
    //     });
    //     it('When the structure of the config file is incorrect', () => {
    //         expect(() => getCollectionsFromConfig('tbl_example_table4', incorrectConfig)).toThrow('Check config file');
    //     });
    // });

    describe('GET REFERENCED COLUMNS', () => {
        it('The function is given a table name and returns the column name and its reference', () => {
            const result = getSQLReferencedColumns('tbl_example_table5', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([{ 'name': 'ProductId', 'ref': 'TableName' }]);
        });
        it('The value returned is of type Array', () => {
            const result = getSQLReferencedColumns('tbl_example_table5', config);
            expect(result).toBeInstanceOf(Array);
        });
        it('The table name should be of type string', () => {
            expect(() => getSQLReferencedColumns(15, config)).toThrow('Check the type of the parameter received');
            expect(() => getSQLReferencedColumns('tbl_example_table5', config)).not.toThrow();
        });
        it('table name does not exist returns an error accordingly', () => {
            expect(() => getSQLReferencedColumns('table_not_exist', config)).toThrow('Check Table Name');
            expect(() => getSQLReferencedColumns('tbl_example_table5', config)).not.toThrow();
        });
        it('A table that does not contain a reference returns an empty array', () => {
            const result = getSQLReferencedColumns('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([]);
            expect(result).toBeInstanceOf(Array);
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getSQLReferencedColumns('tbl_example_table4', incorrectConfig)).toThrow('Check config file');
        });
    });

    describe('GET TABLE ACCORDING TO REF', () => {
        it('A function received a table name and returns the name of the table to which it is directed', () => {
            const result = getTableAccordingToRef('tbl_example_table5', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([{ 'name': 'UnitOfMeasure', 'ref': 'tbl_example_table4' }]);
        });
        it('A function received a table name without reference returns empty array', () => {
            const result = getTableAccordingToRef('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([]);
        });
        it('The value returned is of type array', () => {
            const result = getTableAccordingToRef('tbl_example_table5', config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        });
        it('The table name should be of type string', () => {
            expect(() => getTableAccordingToRef(15, config)).toThrow('Check the type of the parameter received');
            expect(() => getTableAccordingToRef('tbl_example_table5', config)).not.toThrow();
        });
        it('table name does not exist returns an error accordingly', () => {
            expect(() => getTableAccordingToRef('tbl_example_table6', config)).toThrow('Check Table Name');
            expect(() => getTableAccordingToRef('tbl_example_table5', config)).not.toThrow();
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getTableAccordingToRef('tbl_example_table4', incorrectConfig)).toThrow('Check config file');
        });
    });

    describe('GET FOREIGN TABLE AND COLUMN', () => {
        it('A function received a table name, a field name and a config and returns an object that includes a table name and its information', () => {
            const result = getForeignTableDefaultColumn('tbl_example_table5', 'unitOfMeasure', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual({ foreignTableName: 'tbl_example_table4', defaultColumn: 'Name' });
        });
        it('The returned value is of type object', () => {
            const result = getForeignTableDefaultColumn('tbl_example_table5', 'unitOfMeasure', config);
            expect(result).toBeInstanceOf(Object);
        });
        it('The table name is of type string', () => {
            expect(() => getForeignTableDefaultColumn(15, 'unitOfMeasure', config)).toThrow('Check the type of the parameter received');
        });
        it('The field name is of type string', () => {
            expect(() => getForeignTableDefaultColumn('tbl_example_table4', 15, config)).toThrow('Check Field Name');
        });
        it('The table name and field name are of type string', () => {
            expect(() => getForeignTableDefaultColumn(15, 15, config)).toThrow('Check the type of the parameter received');
            expect(() => getForeignTableDefaultColumn('tbl_example_table5', 'unitOfMeasure', config)).not.toThrow();
        });
        it('A table name without a foreign key will return an error accordingly', () => {
            expect(() => getForeignTableDefaultColumn('tbl_example_table4', 'unitOfMeasure', config)).toThrow('Check Field Name');
        });
        it('A table column without a foreign key will return an error accordingly', () => {
            expect(() => getForeignTableDefaultColumn('tbl_example_table4', 'unitOfMeasure', config)).toThrow('Check Field Name');
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getForeignTableDefaultColumn('tbl_example_table4', 'unitOfMeasure', incorrectConfig)).toThrow('Check config file');
        });
    });

    describe('GET ALL COLUMNS FROM A TABLE', () => {
        it('The function received a table name and a config and returns the names of its columns in sql', () => {
            const result = getTableColumnsSQLName('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual(['Id', 'Name']);
        });
        it('The function returns an array', () => {
            const result = getTableColumnsSQLName('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        });
        it('The table name is of type string', () => {
            expect(() => getTableColumnsSQLName(15, config)).toThrow('Check the type of the parameter receive');
            expect(() => getTableColumnsSQLName('tbl_example_table4', config)).not.toThrow();
        });
        it('The table name that does not exist returns an error accordingly', () => {
            expect(() => getTableColumnsSQLName('not_exist_table', config)).toThrow('Check Table Name');
            expect(() => getTableColumnsSQLName('tbl_example_table4', config)).not.toThrow();
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getTableColumnsSQLName('tbl_example_table4', incorrectConfig)).toThrow('Check config file');
        });
    });

    describe(`GET ALL COLUMNS' TYPE FROM A TABLE `, () => {
        it('should get a tablename and return a list of columns with their type', () => {
            const result = getSqlTableColumnsType('tbl_example_table4', config)
            expect(result).toBeDefined()
        })
    })

    describe(`GET ALL CONNECTED TABLES`, ()=>{
        it('should return a list of connected tables', ()=>{
            const response = getConnectedEntities('tbl_PricelistForProducts')
            expect(response).toBeInstanceOf(Array)
        })
    })

    describe('GET INNER REFERENCED COLUMNS', ()=>{
        it('should return an array of referenced columns', ()=>{
            const response=getInnerReferencedColumns('productsPricelist')
            console.log(response)
            expect(response).toBeInstanceOf(Array)
        })
    })

    // -------------------------------------------------------------------------

    // describe('READ JOIN', () => { });
    // describe('SET FULL OBJ', () => { });
    // describe('GET OBJECT WITH FIELD NAME FOR PRIMARY KEY', () => { });   
    // describe('CONVERT FIELD TYPE', () => { });

});
