const { getTableName, getColumns, getProcedures, getvalues } = require('../../../modules/config/createConfig');
const config = require('./TESTconfig/config.json');
const incorrectConfig = require('./TESTconfig/incorrectConfig.json');

describe('TEST ON createConfig.js FILE', () => {

    describe('GET TABLE NAME', () => {
        it('The function works as required', () => {
            const result = getTableName(config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual(
                [['tbl_example_table1',
                'example table with PRIMARY KEY'],
                ['tbl_example_table2',
                'example table with defaultColumn'],
                ['tbl_example_table3',
                'example table with PRIMARY KEY and FOREIGN KEY'],
                ['tbl_example_table4',
                'example table with values in columns'],
                ['tbl_example_table5',
                'example table with references']]);
        });
        it('The function returns an array',  () => {
            const result =  getTableName(config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        });
        it('The function returns an array of arrays',  () => {
            const result =  getTableName(config);
            expect(result).toBeDefined();
            result.forEach(arr=>{ 
                expect(arr).toBeInstanceOf(Array);
            })  
        });
        it('If there is no database:sql in the config file, an error is thrown.', () => {
            expect(() =>  getTableName(incorrectConfig)).toThrow('Internal Server Error');
        });
    });

    describe('GET COLUMNS',() => {
        it('The function accepts a table name and returns its columns' ,()=>{
            const result = getColumns('tbl_example_table1',config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual( [
                {
                    'name': 'Id',
                    'sqlName': 'Id',
                    'type': 'INT IDENTITY PRIMARY KEY NOT NULL'
                },
                {
                    'name': 'measure',
                    'sqlName': 'Measure',
                    'type': 'NVARCHAR(20) NOT NULL '
                },
                {
                    'name': 'disable',
                    'sqlName': 'Disable',
                    'type': 'BIT NOT NULL'
                }
            ]);
        });
        it('The table name is of type string' ,()=>{
            expect(() => getColumns(tbl_example_table1,config)).toThrow('tbl_example_table1 is not defined');
            expect(() => getColumns('tbl_example_table1',config)).not.toThrow();
        });
        it('The returned value is of type array' ,()=>{
            const result = getColumns('tbl_example_table1',config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array)
        });
        it('The table name exists in the config' ,()=>{
            expect(() => getColumns('tbl_example_table6',config)).toThrow('Check Table Name');
            expect(() => getColumns('tbl_example_table1',config)).not.toThrow();
        });
        it('Invalid config file' ,()=>{
            expect(() => getColumns('tbl_example_table5',incorrectConfig)).toThrow('Internal Server Error');
        });
    });

    describe('GET PROCEDURES', () => {
        it('The function works as required', () => {
            const result = getProcedures(config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual(
                [ [ 'pro_example', 'example for test' ] ]
            );
        });
        it('The function returns an array',  () => {
            const result =  getProcedures(config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        });
        it('The function returns an array of arrays',  () => {
            const result =  getProcedures(config);
            expect(result).toBeDefined();
            result.forEach(arr=>{ 
                expect(arr).toBeInstanceOf(Array);
            })  
        });
        it('If there is no database:sql in the config file, an error is thrown.', () => {
            expect(() =>  getProcedures(incorrectConfig)).toThrow('Internal Server Error');
        });
    });

    describe('GET VALUES', () => {
        it('The function accepts a procedure name and returns its values' ,()=>{
            const result = getvalues('pro_example',config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual( [
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
        it('The procedure name is of type string' ,()=>{
            expect(() => getvalues(pro_example,config)).toThrow('pro_example is not defined');
            expect(() => getvalues('pro_example',config)).not.toThrow();
        });
        it('The returned value is of type array' ,()=>{
            const result = getvalues('pro_example',config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array)
        });
        it('The procedure name exists in the config' ,()=>{
            expect(() => getvalues('pro_example2',config)).toThrow('Check Procedure Name');
            expect(() => getvalues('pro_example',config)).not.toThrow();
        });
        it('Invalid config file' ,()=>{
            expect(() => getvalues('pro_example',incorrectConfig)).toThrow('Internal Server Error');
        });
    });

});

