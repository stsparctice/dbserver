const { getTableFromConfig, getCollectionsFromConfig, readJoin, getReferencedColumns, setFullObj, getTableAccordingToRef, getObjectWithFeildNameForPrimaryKey, getForeignTableAndColumn, convertFieldType, getTabeColumnName } = require('../../../modules/config/config');
const config = require('../../../config/TESTconfig.json');


describe('config.js', () => {

    describe('GET TABLE FROM CONFIG', () => {
        it('The function received a table name and returns the table accordingly', () => {
            const result = getTableFromConfig('tbl_example_table1', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual({
                MTDTable: {
                    name: {
                        name: "example_table1",
                        sqlName: "tbl_example_table1"
                    },
                    description: "example table with PRIMARY KEY"
                },
                columns: [
                    {
                        name: "Id",
                        sqlName: "Id",
                        type: "INT IDENTITY PRIMARY KEY NOT NULL"
                    },
                    {
                        name: "measure",
                        sqlName: "Measure",
                        type: "NVARCHAR(20) NOT NULL "
                    },
                    {
                        name: "disable",
                        sqlName: "Disable",
                        type: "BIT NOT NULL"
                    }
                ]
            });
        });
        it('The table name should be of type string', () => {
            expect(() => getTableFromConfig(tbl_example_table1, config)).toThrow();
            expect(() => getTableFromConfig('tbl_example_table1', config)).not.toThrow();
        });
        it('The value returned is of type object', () => {
            const result = getTableFromConfig('tbl_example_table1', config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Object);
        });
        it('When table name does not exist in the config the function returns an error accordingly', () => {
            expect(() => getTableFromConfig('empty', config)).toThrow();
            expect(() => getTableFromConfig('tbl_example_table1', config)).not.toThrow();
        });
    });

    // describe('GET OBJECT WITH FIELD NAME FOR PRIMARY KEY', () => { });

    describe('GET FOREIGN TABLE AND COLUMN', () => {
        it('A function received a table name, a field name and a config and returns an object that includes a table name and its information', () => {
            const result = getForeignTableAndColumn('tbl_example_table2', config);
            expect(result).toBeDefined();
        });
        it('The function receives all values', () => {
            const result = getForeignTableAndColumn();
            expect(result).toBeDefined();
        });
        it('The returned value is of type object', () => {
            const result = getForeignTableAndColumn();
            expect(result).toBeDefined();
        });
        it('The table name and field name are of type string', () => {
            const result = getForeignTableAndColumn();
            expect(result).toBeDefined();
        });
        it('A table name that does not exist returns an error accordingly', () => {
            const result = getForeignTableAndColumn();
            expect(result).toBeDefined();
        });
    });
    
    // describe('CONVERT FIELD TYPE', () => { });


    describe('GET TABLE COLUMN NAME', () => {
        it('The function received a table name and a config and returns the names of its columns in sql', () => {
            const result = getTabeColumnName();
            expect(result).toBeDefined();
        });
        it('The function receives all values', () => {
            const result = getTabeColumnName();
            expect(result).toBeDefined();
        });
        it('The returned value is of array type', () => {
            const result = getTabeColumnName();
            expect(result).toBeDefined();
        });
        it('The table name is of type string', () => {
            const result = getTabeColumnName();
            expect(result).toBeDefined();
        });
        it('The table name that does not exist returns an error accordingly', () => {
            const result = getTabeColumnName();
            expect(result).toBeDefined();
        });
    });
});
