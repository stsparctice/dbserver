const removeKeysFromObject = (origin, keys) => {
    // console.log({origin, keys})
    const newObject = Object.keys(origin).filter(k => keys.includes(k) === false)
        .reduce((obj, key) => {
            obj[key] = origin[key]
            return obj
        }, {})
    return newObject
}

const isEmpyObject = (object)=>{
    return Object.keys(object).length === 0
}


module.exports = {removeKeysFromObject, isEmpyObject}