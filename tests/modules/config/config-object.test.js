const { types, convertToSQLString } = require('../../../modules/config/config-objects');

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
        it('The function will behave like an empty string when value is not sent', () => {
            expect(() => convertToSQLString()).toThrow('value must be defined');
        });
        it('The function will throw an error if the value type is not string', () => {
            expect(() => convertToSQLString(5555)).toThrow('value must be a string');
            expect(() => convertToSQLString(false)).toThrow('value must be a string');
            expect(() => convertToSQLString([1, 2, 3])).toThrow('value must be a string');
            expect(() => convertToSQLString('hello world')).not.toThrow();
        });
    });

    describe('type FUNCTIONS', () => {

        describe('NVARCHAR', () => {

            it("The typeNodeName should be 'string'", () => {
                expect(types.NVARCHAR.typeNodeName).toBe('string');
            });
            it('The function works as required', () => {
                expect(types.NVARCHAR).toBeDefined();
                expect(types.NVARCHAR.parseNodeTypeToSqlType('hi there')).toBe("N'hi there'");
            });
            it('The function returns string', () => {
                expect(types.NVARCHAR).toBeDefined();
                expect(typeof types.NVARCHAR.parseNodeTypeToSqlType('hi there')).toBe('string');
            });
            it('The function will throw an error when the parameter will not be sent', () => {
                expect(types.NVARCHAR).toBeDefined();
                expect(() => types.NVARCHAR.parseNodeTypeToSqlType(undefined)).toThrow('value must be defined');
            });

        });

        describe('BIT', () => {

            it("The typeNodeName should be 'boolean'", () => {
                expect(types.BIT.typeNodeName).toBe('boolean');
            });
            it('The function works as required', () => {
                expect(types.BIT).toBeDefined();
                expect(types.BIT.parseNodeTypeToSqlType(true)).toBe("'true'");
            });
            it('The function returns string', () => {
                expect(types.BIT).toBeDefined();
                expect(typeof types.BIT.parseNodeTypeToSqlType(true)).toBe('string');
            });
            it('The function will return false when the parameter will not be sent', () => {
                expect(types.BIT).toBeDefined();
                expect(types.BIT.parseNodeTypeToSqlType()).toBe(`'false'`);
            });
        });

        describe('DATETIME', () => {

            it("The typeNodeName should be 'Date'", () => {
                expect(types.DATETIME.typeNodeName).toBe('Date');
            });
            it('The function works as required', () => {
                const today = new Date()
                expect(types.DATETIME).toBeDefined();
                expect(types.DATETIME.parseNodeTypeToSqlType(today)).toBe(`'${today.toISOString()}'`);
            });
            it('The function returns string', () => {
                expect(types.DATETIME).toBeDefined();
                expect(typeof types.DATETIME.parseNodeTypeToSqlType(new Date('2023-04-04'))).toBe('string');
            });
            it('The function will throw an error when the parameter will not be sent', () => {
                expect(types.DATETIME).toBeDefined();
                expect(() => types.DATETIME.parseNodeTypeToSqlType()).toThrow('value is required');
            });
        });

        describe('INT', () => {

            it("The typeNodeName should be 'number'", () => {
                expect(types.INT.typeNodeName).toBe('number');
            });
            it('The function works as required', () => {
                expect(types.INT).toBeDefined();
                expect(types.INT.parseNodeTypeToSqlType(1)).toBe(1);
            });
            it('The function returns number', () => {
                expect(types.INT).toBeDefined();
                expect(typeof types.INT.parseNodeTypeToSqlType(45)).toBe('number');
            });
        });

        describe('REAL', () => {

            it("The typeNodeName should be 'number'", () => {
                expect(types.REAL.typeNodeName).toBe('number');
            });
            it('The function works as required', () => {
                expect(types.REAL).toBeDefined();
                expect(types.REAL.parseNodeTypeToSqlType(123.456)).toBe(123.456);
            });
            it('The function returns number', () => {
                expect(types.REAL).toBeDefined();
                expect(typeof types.REAL.parseNodeTypeToSqlType(123.456)).toBe('number');
            });
        });

        describe('FLOAT', () => {

            it("The typeNodeName should be 'number'", () => {
                expect(types.FLOAT.typeNodeName).toBe('number');
            });
            it('The function works as required', () => {
                expect(types.FLOAT).toBeDefined();
                expect(types.FLOAT.parseNodeTypeToSqlType(1.6)).toBe(1.6);
            });
            it('The function returns number', () => {
                expect(types.FLOAT).toBeDefined();
                expect(typeof types.FLOAT.parseNodeTypeToSqlType(3.9)).toBe('number');
            });
        });

    });

});
