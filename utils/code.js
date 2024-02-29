const removeKeysFromObject = (origin, keys) => {
    const newObject = Object.keys(origin).filter(k => keys.includes(k) === false)
        .reduce((obj, key) => {
            obj[key] = origin[key]
            return obj
        }, {})
    return newObject
}

const isEmpyObject = (object) => {
    return Object.keys(object).length === 0
}

const compareObjectValues = (obj1, obj2) => {
    const obj1Keys = Object.keys(obj1)
    const obj2Keys = Object.keys(obj2)
    if (obj1Keys.length != obj2Keys.length)
        return false
    const differentKeys = obj1Keys.filter(key => obj2Keys.includes(key) == false)
    if (differentKeys.length > 0)
        return false
    for (let key of obj1Keys) {
        if ((obj1[key] instanceof Date) && !isNaN(obj1[key])) {
            if ((obj2[key] instanceof Date) && !isNaN(obj2[key])) {
                if (obj1[key].toISOString() !== obj2[key].toISOString()) {
                    return false
                }
                continue;
            }
        }
        if (obj1[key] !== obj2[key]) {
            return false
        }
    }

    return true
}

const groupByObjects = (list, key) => {

    const groups = list.reduce((res, obj) => {
        if (res.length === 0)
            return [{ key: obj[key], value: [obj] }]
        const group = res.find(gr => obj[key] === gr.key)
        if (group) {
            group.value = [...group.value, obj]
        }
        else {
            res = [...res, { key: obj[key], value: [obj] }]
        }
        return res;
    }, [])
    return groups
}

const distinctObjectsArrays = (list) => {
    const distinct = list.reduce((arr, obj) => {
        if (arr.length === 0) {
            return [obj]
        }
        else {
            let exist = arr.some(item => compareObjectValues(item, obj))
            if (!exist) {
                arr = [...arr, obj]
            }
            return arr
        }
    }, [])
    return distinct
}


module.exports = {
    removeKeysFromObject,
    isEmpyObject,
    compareObjectValues,
    groupByObjects,
    distinctObjectsArrays
}