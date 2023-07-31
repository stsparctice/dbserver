const {getTableFromConfig, getCollectionsFromConfig, readJoin, getReferencedColumns, setFullObj, getTableAccordingToRef, getObjectWithFeildNameForPrimaryKey, getForeignTableAndColumn,  convertFieldType, getTabeColumnName} = require('../../../modules/config/config')

describe('config.js', () => {
    describe('GET TABLE FROM CONFIG', () => { 
        it('A function received a table name and returns the table accordingly' ,()=>{
            const result = getTableFromConfig();
            expect(result).toBeDefined();
        });        
        it('The function received a value (table name)' ,()=>{
            const result = getTableFromConfig();
            expect(result).toBeDefined();
        });
        it('The table name should be of type string' ,()=>{
            const result = getTableFromConfig();
            expect(result).toBeDefined();
        });
        it('The value returned is of type object' ,()=>{
            const result = getTableFromConfig();
            expect(result).toBeDefined();
        });
        it('Table name does not exist returns an error accordingly' ,()=>{
            const result = getTableFromConfig();
            expect(result).toBeDefined();
        });        
    });

    describe('GET COLLECTIONS FROM CONFIG', () => {
        it('A function received a collection name and returns the collection accordingly' ,()=>{
            const result = getCollectionsFromConfig();
            expect(result).toBeDefined();
        }); 
        it('The function received a value (collection name)' ,()=>{
            const result = getCollectionsFromConfig();
            expect(result).toBeDefined();
        });
        it('The collection name should be of type string' ,()=>{
            const result = getCollectionsFromConfig();
            expect(result).toBeDefined();
        });
        it('The value returned is of type object' ,()=>{
            const result = getCollectionsFromConfig();
            expect(result).toBeDefined();
        });
        it('Collection name does not exist returns an error accordingly' ,()=>{
            const result = getCollectionsFromConfig();
            expect(result).toBeDefined();
        }); 
    });
    describe('READ JOIN', () => { });
    describe('GET REFERENCED COLUMNS', () => { });
    describe('SET FULL OBJ', () => { });
    describe('GET TABLE ACCORDING TO REF', () => { });
    describe('GET OBJECT WITH FIELD NAME FOR PRIMARY KEY', () => { });
    describe('GET FOREIGN TABLE AND COLUMN', () => { });
    describe('CONVERT FIELD TYPE', () => { });
    describe('GET TABLE COLUMN NAME', () => { });
})