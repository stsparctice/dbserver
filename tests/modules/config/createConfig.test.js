const { getTableName, getColumns, getProcedures, getvalues } = require('../../../modules/config/createConfig');
const config = require('../../../config/TESTconfig/config.json');
const incorrectConfig = require('../../../config/TESTconfig/incorrectConfig.json');

describe('TEST ON createConfig.js FILE', () => {

    describe('GET TABLE NAME', () => {
        it('The function works as required', () => {
            const result = getTableName(config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual(
                ['tbl_example_table1',
                'example table with PRIMARY KEY',
                'tbl_example_table2',
                'example table with defaultColumn',
                'tbl_example_table3',
                'example table with PRIMARY KEY and FOREIGN KEY',
                'tbl_example_table4',
                'example table with values in columns',
                'tbl_example_table5',
                'example table with references']);
        });
        it('The function returns an array',  () => {
            const result =  getTableName(config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        });
        it('If there is no database:sql in the config file, an error is thrown.', () => {
            expect(() =>  getTableName(incorrectConfig)).toThrow();
        });
    });

    // describe('GET COLUMNS', () => {
    //     it('' ,()=>{
    //         const result = getColumns('',config);
    //         expect(result).toBeDefined();
    //         expect(result).toStrictEqual();
    //     });
    // });

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

