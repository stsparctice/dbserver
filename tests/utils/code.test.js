const {groupByObjects, distinctObjectsArrays, compareObjectValues} = require('../../utils/code')

describe('GROUP BY OBJECTS', ()=>{
    it('should group a list of objects into groups with key and value properties', ()=>{
        const data = [{ x:56, y:72}, { x:56, y:103}, {x:56, y:99}, {x:45, y:12}, {x:45, y:9}]
        const groups = groupByObjects(data, 'x')
        expect(groups.length).toBe(2)
    })
})

describe('DISTINCT OBJECT ARRAY', ()=>{
    it('should return distinct arrays', ()=>{
        const data = [{ x:56, y:72}, { x:56, y:72}, {x:56, y:99}, {x:45, y:9}, {x:45, y:9}]
        const list = distinctObjectsArrays(data)
        expect(list.length).toBe(3)
    })
})