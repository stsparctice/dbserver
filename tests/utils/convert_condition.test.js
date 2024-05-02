const { convertQueryToObject, buildQueryObject } = require('../../utils/convert_query')


describe('CONVER QUERY TO OBJECT', () => {
    it('should convert a regular query key value pair to an object', () => {
        const result = convertQueryToObject({ disabled: 0, clientcode: 1000 })

        expect(result).toBeDefined()
    })

    it('should convert an AND query key value pair to an object', () => {
        const result = convertQueryToObject({ start: 'AND', disabled: 0, clientcode: 1000, end: 'AND' })

        expect(result).toBeDefined()
    })



    it('should convert an Includes query key value pair to an object', () => {
        const result = convertQueryToObject({ start_0: 'INCLUDES', itemDescribe_1: 'ב', end_2: 'INCLUDES' })
        expect(result).toBeDefined()
        expect(result.INCLUDES).toBeInstanceOf(Object)
        // expect(result.INCLUDES[0]).
    })

    it('should convert  a query with Includes and more items', () => {
        const result = convertQueryToObject({ addition_0: false, disabled_1: false, start_3: 'INCLUDES', name_4: 'ב', end_5: 'INCLUDES' })
        console.log(result)
        expect(result).toBeDefined()
        expect(Object.keys(result).length).toBe(3)
        expect(result.INCLUDES).toBeInstanceOf(Object)
        // expect(result.INCLUDES[0]).
    })
})

describe('BUILD QUERY OBJECT', () => {
    it('should convert an array of of items in OR operator', () => {
        const result = buildQueryObject([
            { start_1: 'OR' },
            { product_2: 'cementStrength' },
            { product_3: 'cementGrain' },
            { product_4: 'cementSomech' },
            { product_5: 'cementDegree' },
            { end_6: 'OR' }
        ], 0, {})
        console.log({ result });
        expect(result).toBeDefined()
        expect(result.OR).toEqual([{ product: 'cementStrength' }, { product: 'cementGrain' }, { product: 'cementSomech' }, { product: 'cementDegree' }])
    })
})