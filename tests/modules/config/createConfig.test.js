const { getTableName, getColumns, getProcedures, getvalues } = require('../../../modules/config/createConfig');
const config = require('../../../config/TESTconfig/config.json');
const incorrectConfig = require('../../../config/TESTconfig/incorrectConfig.json');

describe('TEST ON createConfig.js FILE', () => {

    // describe('GET TABLE NAME', () => {
    //     it('' ,()=>{
    //         const result = getTableName('',config);
    //         expect(result).toBeDefined();
    //         expect(result).toStrictEqual();
    //     });
    // });

    describe('GET COLUMNS',() => {
        it('The function accepts a table name and returns its columns' ,()=>{
            const result = getColumns('tbl_example_table1',config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual( [
                {
                    "name": "Id",
                    "sqlName": "Id",
                    "type": "INT IDENTITY PRIMARY KEY NOT NULL"
                },
                {
                    "name": "measure",
                    "sqlName": "Measure",
                    "type": "NVARCHAR(20) NOT NULL "
                },
                {
                    "name": "disable",
                    "sqlName": "Disable",
                    "type": "BIT NOT NULL"
                }
            ]);
        });
        it('The table name is of type string' ,()=>{
            expect(() => getColumns(tbl_example_table1,config)).toThrow();
            expect(() => getColumns("tbl_example_table1",config)).not.toThrow();
        });
        it('The returned value is of type array' ,()=>{
            const result = getColumns('tbl_example_table1',config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array)
        });
        it('The table name exists in the config' ,()=>{
            expect(() => getColumns("tbl_example_table6",config)).toThrow();
            expect(() => getColumns("tbl_example_table1",config)).not.toThrow();
        });
        it('Invalid config file' ,()=>{
            expect(() => getColumns("tbl_example_table5",incorrectConfig)).toThrow();
        });
    });

    // describe('GET PROCEDURES', () => {
    //     it('' ,()=>{
    //         const result = getProcedures('',config);
    //         expect(result).toBeDefined();
    //         expect(result).toStrictEqual();
    //     });
    // });

    // describe('GET VALUES', () => {
    //     it('' ,()=>{
    //         const result = getvalues('',config);
    //         expect(result).toBeDefined();
    //         expect(result).toStrictEqual();
    //     });
    // });

});

