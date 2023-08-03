const {convertQueryToObject} = require('../../utils/convert_condition')


describe('CONVER QUERY TO OBJECT', ()=>{
    it ('should convert a regular query key value pair to an object' , ()=>{
        const result = convertQueryToObject({Disabled:0, clientcode:1000})

        expect(result).toBeDefined()
    })

    it ('should convert an AND query key value pair to an object' , ()=>{
        const result = convertQueryToObject({start:'AND', Disabled:0, clientcode:1000, end:'AND'})

        expect(result).toBeDefined()
    })

    it ('should convert a Includes query key value pair to an object' , ()=>{
        const result = convertQueryToObject({start_0:'INCLUDES', itemDescribe_1:'ב',  end_2:'INCLUDES'})
        expect(result).toBeDefined()
        expect(result.INCLUDES).toBeInstanceOf(Array)
        // expect(result.INCLUDES[0]).
    })
})