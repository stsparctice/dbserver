const { getTableName, getColumns, getProcedures, getvalues } = require('../../../modules/config/create-config');
const config = require('./TESTconfig/config.json');
const incorrectConfig = require('./TESTconfig/incorrectConfig.json');

describe('TEST ON createConfig.js FILE', () => {

    describe('GET TABLE NAME', () => {
        it('The function works as required', () => {
            const result = getTableName(config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual(
                [['tbl_example_table4',
                    'example table with values in columns'],
                ['tbl_example_table5',
                    'example table with references']]);
        });
        it('The function returns an array', () => {
            const result = getTableName(config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        });
        it('The function returns an array of arrays', () => {
            const result = getTableName(config);
            expect(result).toBeDefined();
            result.forEach(arr => {
                expect(arr).toBeInstanceOf(Array);
            })
        });
        it('If there is no database:sql in the config file, an error is thrown.', () => {
            expect(() => getTableName(incorrectConfig)).toThrow('Check config file');
        });
    });

    describe('GET COLUMNS', () => {
        it('The function accepts a table name and returns its columns', () => {
            const result = getColumns('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([
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
            ]);
        });
        it('The table name is of type string', () => {
            expect(() => getColumns(15, config)).toThrow('Check the type of the parameter received');
        });
        it('The returned value is of type array', () => {
            const result = getColumns('tbl_example_table4', config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array)
        });
        it('The table name exists in the config', () => {
            expect(() => getColumns('table_not_exist', config)).toThrow('Check Table Name');
            expect(() => getColumns('tbl_example_table4', config)).not.toThrow();
        });
        it('Invalid config file', () => {
            expect(() => getColumns('tbl_example_table5', incorrectConfig)).toThrow('Check config file');
        });
    });

    describe('GET PROCEDURES', () => {
        it('The function works as required', () => {
            const result = getProcedures(config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([['pro_example', 'example for test']]);
        });
        it('The function returns an array', () => {
            const result = getProcedures(config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        });
        it('The function returns an array of arrays', () => {
            const result = getProcedures(config);
            expect(result).toBeDefined();
            result.forEach(arr => {
                expect(arr).toBeInstanceOf(Array);
            })
        });
        it('If there is no database:sql in the config file, an error is thrown.', () => {
            expect(() => getProcedures(incorrectConfig)).toThrow('Check config file');
        });
    });

    describe('GET VALUES', () => {
        it('The function accepts a procedure name and returns its values', () => {
            const result = getvalues('pro_example', config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([
                {
                    'name': {
                        'tableName': 'tableName'
                    },
                    'type': {
                        'type': 'NVARCHAR(20)'
                    }
                },
                {
                    'name': {
                        'values': 'values'
                    },
                    'type': {
                        'type': 'NVARCHAR(MAX)'
                    }
                },
                {
                    'name': {
                        'condition': 'condition'
                    },
                    'type': {
                        'type': 'NVARCHAR(MAX)'
                    }
                }
            ]);
        });
        it('The procedure name is of type string', () => {
            expect(() => getvalues(15, config)).toThrow('Check the type of the parameter received');
        });
        it('The returned value is of type array', () => {
            const result = getvalues('pro_example', config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array)
        });
        it('The procedure name exists in the config', () => {
            expect(() => getvalues('procedure_not_exist', config)).toThrow('Check Procedure Name');
            expect(() => getvalues('pro_example', config)).not.toThrow();
        });
        it('Invalid config file', () => {
            expect(() => getvalues('pro_example', incorrectConfig)).toThrow('Check config file');
        });
    });

});

