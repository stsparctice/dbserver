const { getTableFromConfig, getCollectionsFromConfig, readJoin, getReferencedColumns, setFullObj, getTableAccordingToRef, getObjectWithFeildNameForPrimaryKey, getForeignTableAndColumn, convertFieldType, getTabeColumnName } = require('../../../modules/config/config');
const config = require('./TESTconfig/config.json');
const incorrectConfig = require('./TESTconfig/incorrectConfig.json');

describe('TEST ON config.js FILE', () => {
    describe('GET TABLE FROM CONFIG', () => {
        it('The function received a table name and returns the table accordingly', () => {
            const result = getTableFromConfig('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual( {
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
                        "name": "Id",
                        "sqlName": "Id",
                        "type": "INT IDENTITY PRIMARY KEY NOT NULL"
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

    describe('GET COLLECTIONS FROM CONFIG', () => {
        it('A function received a collection name and returns the collection accordingly', () => {
            const result = getCollectionsFromConfig('example', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual({ 'mongoName': 'example', 'name': 'example' });
        });
        it('The value returned is of type object', () => {
            const result = getCollectionsFromConfig('example', config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Object);
        });
        it('The collection name should be of type string', () => {
            expect(() => getCollectionsFromConfig(15, config)).toThrow('Check the type of the parameter received');
            expect(() => getCollectionsFromConfig('example', config)).not.toThrow();
        });
        it('Collection name does not exist returns an error accordingly', () => {
            expect(() => getCollectionsFromConfig('collection_not_exist', config)).toThrow('Check Collection Name');
            expect(() => getCollectionsFromConfig('example', config)).not.toThrow();
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getCollectionsFromConfig('tbl_example_table4', incorrectConfig)).toThrow('Check config file');
        });
    });

    describe('GET REFERENCED COLUMNS', () => {
        it('The function is given a table name and returns the column name and its reference', () => {
            const result = getReferencedColumns('tbl_example_table5', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([{ 'name': 'ProductId', 'ref': 'TableName' }]);
        });
        it('The value returned is of type Array', () => {
            const result = getReferencedColumns('tbl_example_table5', config);
            expect(result).toBeInstanceOf(Array);
        });
        it('The table name should be of type string', () => {
            expect(() => getReferencedColumns(15, config)).toThrow('Check the type of the parameter received');
            expect(() => getReferencedColumns('tbl_example_table5', config)).not.toThrow();
        });
        it('table name does not exist returns an error accordingly', () => {
            expect(() => getReferencedColumns('table_not_exist', config)).toThrow('Check Table Name');
            expect(() => getReferencedColumns('tbl_example_table5', config)).not.toThrow();
        });
        it('A table that does not contain a reference returns an empty array', () => {
            result = getReferencedColumns('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([]);
            expect(result).toBeInstanceOf(Array);
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getReferencedColumns('tbl_example_table4', incorrectConfig)).toThrow('Check config file');
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
            const result = getForeignTableAndColumn('tbl_example_table5', 'unitOfMeasure', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual({ foreignTableName: 'TBL_EXAMPLE_TABLE4', defaultColumn: 'Name' });
        });
        it('The returned value is of type object', () => {
            const result = getForeignTableAndColumn('tbl_example_table5', 'unitOfMeasure', config);
            expect(result).toBeInstanceOf(Object);
        });
        it('The table name is of type string', () => {
            expect(() => getForeignTableAndColumn(15, 'unitOfMeasure', config)).toThrow('Check the type of the parameter received');
        });
        it('The field name is of type string', () => {
            expect(() => getForeignTableAndColumn('tbl_example_table4', 15, config)).toThrow('Check the type of the parameter received');
        });
        it('The table name and field name are of type string', () => {
            expect(() => getForeignTableAndColumn(15, 15, config)).toThrow('Check the type of the parameter received');
            expect(() => getForeignTableAndColumn('tbl_example_table5', 'unitOfMeasure', config)).not.toThrow();
        });
        it('A table name without a foreign key will return an error accordingly', () => {
            expect(() => getForeignTableAndColumn('tbl_example_table4', 'unitOfMeasure', config)).toThrow('Check Field Name');
        });
        it('A table column without a foreign key will return an error accordingly', () => {
            expect(() => getForeignTableAndColumn('tbl_example_table4', 'unitOfMeasure', config)).toThrow('Check Field Name');
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getForeignTableAndColumn('tbl_example_table4', 'unitOfMeasure', incorrectConfig)).toThrow('Check config file');
        });
    });

    describe('GET TABLE COLUMN NAME', () => {
        it('The function received a table name and a config and returns the names of its columns in sql', () => {
            const result = getTabeColumnName('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual(['Id']);
        });
        it('The function returns an array', () => {
            const result = getTabeColumnName('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        });
        it('The table name is of type string', () => {
            expect(() => getTabeColumnName(15, config)).toThrow('Check the type of the parameter receive');
            expect(() => getTabeColumnName('tbl_example_table4', config)).not.toThrow();
        });
        it('The table name that does not exist returns an error accordingly', () => {
            expect(() => getTabeColumnName('not_exist_table', config)).toThrow('Check Table Name');
            expect(() => getTabeColumnName('tbl_example_table4', config)).not.toThrow();
        });
        it('When the structure of the config file is incorrect', () => {
            expect(() => getTabeColumnName('tbl_example_table4', incorrectConfig)).toThrow('Check config file');
        });
    });

    // -------------------------------------------------------------------------

    // describe('READ JOIN', () => { });
    // describe('SET FULL OBJ', () => { });
    // describe('GET OBJECT WITH FIELD NAME FOR PRIMARY KEY', () => { });   
    // describe('CONVERT FIELD TYPE', () => { });

});
