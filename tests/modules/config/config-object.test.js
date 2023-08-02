const { types, convertToSQLString } = require('../../../modules/config/config-objects');
const config = require('./TESTconfig/config.json');
const incorrectConfig = require('./TESTconfig/incorrectConfig.json');


describe('TEST ON config-object.js FILE', () => {

    describe('CONVERT TO SQL STRING', () => {

        it('The function works as required for a string containing special characters', () => {
            const result = convertToSQLString('hello world$');
            expect(result).toBeDefined();
            expect(result).toBe("concat(N'hello world',char(36))");
        });
        it('The function works as required for a string that does not contain special characters', () => {
            const result = convertToSQLString('hello world');
            expect(result).toBeDefined();
            expect(result).toBe("N'hello world'");
        });
        it('The function also works when an empty string is sent', () => {
            const result = convertToSQLString('');
            expect(result).toBeDefined();
            expect(result).toBe("N''");            
        });
        it('The function will throw an error if the value type is not string', () => {
            expect(() => convertToSQLString(5555)).toThrow('value must be a string');
            expect(() => convertToSQLString(false)).toThrow('value must be a string');
            expect(() => convertToSQLString([1, 2, 3])).toThrow('value must be a string');
            expect(() => convertToSQLString('hello world')).not.toThrow();           
        });
    });


});
