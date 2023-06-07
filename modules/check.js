const config = require('../config.json');

//Check a read object
async function checkObjRead(obj) {
    let message = await isEmpty(obj);
    if (message) {
        return message;
    };
    message = await AllKeysExistAndValid(obj, [{ 'tableName': 'string' }, { 'columns': 'string' }]);
    if (message) {
        return message;
    };
    message = await ConditionExist(obj);
    if (message) {
        return message;
    };
};

//Check a readAll object
async function checkObjReadAll(obj) {
    let message = await isEmpty(obj);
    if (message) {
        return message;
    };
    message = await AllKeysExistAndValid(obj, [{ 'tableName': 'string' }, { 'condition': 'string' }]);
    if (message) {
        return message;
    };
    message = await ConditionExist(obj);
    if (message) {
        return message;
    };
};

//Check a create object
async function checkObjCreate(obj) {
    let message = await isEmpty(obj);
    if (message) {
        return message;
    };
    message = await AllKeysExistAndValid(obj, [{ 'tableName': 'string' }, { 'columns': 'string' }, { 'values': 'string' }]);
    if (message) {
        return message;
    };
    message = await ColsEqualsToVals(obj);
    if (message) {
        return message;
    };
    message = await isPerfect(obj);
    if (message) {
        return message;
    };
};

//Check if the object is empty 
async function isEmpty(obj) {
    if (Object.keys(obj).length == 0) {
        return 'The object is empty';
    };
};

//Check if all keys exist and the values are valid
async function AllKeysExistAndValid(obj, arrayOfObjects) {
    for (let i = 0; i < arrayOfObjects.length; i++) {
        if (!Object.keys(obj).includes(Object.keys(arrayOfObjects[i])[0])) {
            return `Where is the '${Object.keys(arrayOfObjects[i])}' key?`;
        };
        let key = Object.keys(arrayOfObjects[i]);
        key = `${key}`;
        if (typeof (obj[key]) != Object.values(arrayOfObjects[i])) {
            return `The value of obj[${Object.keys(arrayOfObjects[i])}] must be ${Object.values(arrayOfObjects[i])}`;
        };
    };
};

//Check if there is condition and its valid
async function ConditionExist(obj) {
    if (Object.keys(obj).includes('condition')) {
        if (typeof (obj['condition']) != "string") {
            return 'The condition statement must be a string';
        };
        if ((obj['condition']).includes('WHERE') || (obj['condition']).includes('where') || (obj['condition']).includes('Where')) {
            return "The condition statement shouldnt includes the 'where' word";
        };
    };
};

//Check if the columns length is equals to values length
async function ColsEqualsToVals(obj) {
    let { columns, values } = obj;
    let array1 = await columns.split(',');
    let array2 = await values.split(',');
    if (array1.length === array2.length) return;
    return array1.length > array2.length ? 'One value is missing' : 'One column is missing';
};

//Check the values of object
async function isPerfect(obj) {
    let { tableName, columns, values } = obj;
    let array1 = await splitString(columns);
    let array2 = await splitString(values);
    let newObj = config.find(a => { return Object.keys(a).includes('sql'); });
    newObj = newObj['sql'].find(b => { return Object.keys(b).includes('Tables'); });
    newObj = newObj['Tables'].find(c => { return Object.values(c['MTDTable']['name']).includes(tableName) })['columns'];
    for (let d = 0; d < newObj.length; d++) {
        if ((newObj[d]['type']['type']).includes('NOT NULL')) {
            if (!array1.includes(Object.values(newObj[d]['name'])[0]) && Object.values(newObj[d]['name'])[0] !== 'SerialNumber') {
                return `The ${Object.values(newObj[d]['name'])[0]} column is required to be filled`;
            };
            let index = array1.indexOf(...Object.values(newObj[d]['name']));
            if (Object.values(newObj[d]['type'])[0].includes('BIT')) {
                if (typeof (array2[index]) != 'undefined' && array2[index] != 'False' && array2[index] != 'True' && array2[index] != 'FALSE' && array2[index] != 'TRUE' && array2[index] != '0' && array2[index] != '1') {
                    return `The ${array1[index]} value must be a boolean value`;
                };
            };
            if (Object.values(newObj[d]['type'])[0].includes('INT') || Object.values(newObj[d]['type'])[0].includes('FLOAT')) {
                if (typeof (array2[index]) != 'undefined' && array2[index].includes(`'`)) {
                    return `The ${array2[index]} value must be a number`;
                };
                if (typeof (array2[index]) != 'undefined' && Object.values(newObj[d]['type'])[0].includes('INT') && array2[index].includes('.')) {
                    return `The ${array2[index]} value must be int and not float`;
                };
            };
            if (Object.values(newObj[d]['type'])[0].includes('VARCHAR') || Object.values(newObj[d]['type'])[0].includes('DATE')) {
                if (!array2[index].includes(`'`)) {
                    return `The ${array2[index]} value must be a string`;
                };
                let start = Object.values(newObj[d]['type'])[0].indexOf('(');
                let end = Object.values(newObj[d]['type'])[0].indexOf(')');
                let max = parseInt(Object.values(newObj[d]['type'])[0].substring(start + 1, end));
                if (Object.values(newObj[d]['type'])[0].includes('NVARCHAR') && array2[index].length > max) {
                    return `The ${array1[index]} is limited to ${max} characters`;
                };
            };
        };
    };
};

async function splitString(str) {
    arr = [];
    let s = '';
    for (let i = 0; i <= str.length; i++) {
        if (i === str.length) {
            arr.push(s);
            break;
        };
        if (str.charAt(i) != `,`) {
            s += str.charAt(i);
        }
        else {
            arr.push(s);
            s = '';
        };
    };
    return arr;
};

module.exports = { checkObjRead, checkObjReadAll, checkObjCreate };
