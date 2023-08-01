const { getTableName, getColumns, getProcedures, getvalues } = require('../../../modules/config/createConfig');
const config = require('../../../config/TESTconfig/config.json');

describe('TEST ON createConfig.js FILE', () => {

    describe('GET TABLE NAME', () => {
        it('' ,()=>{
            const result = getTableName('',config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual();
        });
    });

    describe('GET COLUMNS', () => {
        it('' ,()=>{
            const result = getColumns('',config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual();
        });
    });

    describe('GET PROCEDURES', () => {
        it('' ,()=>{
            const result = getProcedures('',config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual();
        });
    });

    describe('GET VALUES', () => {
        it('' ,()=>{
            const result = getvalues('',config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual();
        });
    });

});

