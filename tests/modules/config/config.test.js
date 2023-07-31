const {getTableFromConfig, getCollectionsFromConfig, readJoin, getReferencedColumns, setFullObj, getTableAccordingToRef, getObjectWithFeildNameForPrimaryKey, getForeignTableAndColumn,  convertFieldType, getTabeColumnName} = require('../../../modules/config/config')
const config = require('../../../config/TESTconfig.json');

describe('config.js', () => {
    // describe('GET TABLE FROM CONFIG', () => { 
    //     it('A function received a table name and returns the table accordingly' ,()=>{
    //         const result = getTableFromConfig();
    //         expect(result).toBeDefined();
    //     });        
    //     it('The function received a value (table name)' ,()=>{
    //         const result = getTableFromConfig();
    //         expect(result).toBeDefined();
    //     });
    //     it('The table name should be of type string' ,()=>{
    //         const result = getTableFromConfig();
    //         expect(result).toBeDefined();
    //     });
    //     it('The value returned is of type object' ,()=>{
    //         const result = getTableFromConfig();
    //         expect(result).toBeDefined();
    //     });
    //     it('Table name does not exist returns an error accordingly' ,()=>{
    //         const result = getTableFromConfig();
    //         expect(result).toBeDefined();
    //     });        
    // });

    describe('GET COLLECTIONS FROM CONFIG', () => {
        it('A function received a collection name and returns the collection accordingly' ,()=>{
            const result = getCollectionsFromConfig("example",config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual({"mongoName": "example", "name": "example"});
        }); 
        it('The value returned is of type object' ,()=>{
            const result = getCollectionsFromConfig("example",config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Object);
        });
        it('The collection name should be of type string' ,()=>{
            expect(()=>getCollectionsFromConfig(example,config)).toThrow();
            expect(()=>getCollectionsFromConfig("example",config)).not.toThrow();
        });
        it('Collection name does not exist returns an error accordingly' ,()=>{
            expect(()=>getCollectionsFromConfig("exmple",config)).toThrow();
            expect(()=>getCollectionsFromConfig("example",config)).not.toThrow();
        }); 
    });

    // // describe('READ JOIN', () => { });

    describe('GET REFERENCED COLUMNS', () => {
        it('The function is given a table name and returns the column name and its reference' ,()=>{
            const result = getReferencedColumns('tbl_example_table5',config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([{"name": "ProductId", "ref": "TableName"}]);
        });         
        it('The value returned is of type Array' ,()=>{
            const result = getReferencedColumns('tbl_example_table5',config);
            expect(result).toBeInstanceOf(Array);
        }); 
        it('The table name should be of type string' ,()=>{            
            expect(() => getReferencedColumns(tbl_example_table5 ,config)).toThrow();
            expect(() => getReferencedColumns('tbl_example_table5' ,config)).not.toThrow();
        }); 
        it('table name does not exist returns an error accordingly' ,()=>{
            expect(() => getReferencedColumns('stam' ,config)).toThrow();
            expect(() => getReferencedColumns('tbl_example_table5' ,config)).not.toThrow();
        }); 
        it('A table that does not contain a reference returns an empty array' ,()=>{
            result = getReferencedColumns('tbl_example_table2' ,config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([]);      
            expect(result).toBeInstanceOf(Array);    
        }); 
    });
    
    // describe('SET FULL OBJ', () => { });
    
    describe('GET TABLE ACCORDING TO REF', () => {
        it('A function received a table name and returns the name of the table to which it is directed' ,()=>{
            const result = getTableAccordingToRef("tbl_example_table1",config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([]);
        }); 
        it('A function received a table name and returns empty array' ,()=>{
            const result = getTableAccordingToRef("tbl_example_table5",config);
            expect(result).toBeDefined();
            expect(result).toStrictEqual([{"name": "UnitOfMeasure", "ref": "tbl_example_table1"}]);
        }); 
        it('The value returned is of type array' ,()=>{
            const result = getTableAccordingToRef("tbl_example_table5",config);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(Array);
        }); 
        it('The table name should be of type string' ,()=>{
            expect(()=>getTableAccordingToRef(15,config)).toThrow();
            expect(()=>getTableAccordingToRef("tbl_example_table5",config)).not.toThrow();
        }); 
        it('The table name should be of type string' ,()=>{
            expect(()=>getTableAccordingToRef(config)).toThrow();
            expect(()=>getTableAccordingToRef("tbl_example_table5",config)).not.toThrow();
        }); 
        it('table name does not exist returns an error accordingly' ,()=>{
            expect(()=>getTableAccordingToRef("tbl_example_table6",config)).toThrow();
            expect(()=>getTableAccordingToRef("tbl_example_table5",config)).not.toThrow();
        }); 
    });
    
    // describe('GET OBJECT WITH FIELD NAME FOR PRIMARY KEY', () => { });   

})