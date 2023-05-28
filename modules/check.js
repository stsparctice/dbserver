const config = require('../config.json')



// לאה יקרה!!
// בסיום השיעור תתקשרי אלי לפני שאת מתחילה לעבוד ולפני שאת פותחת לבדוק מה עשיתי
// תודה מראש!!!!!!!












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
}

//Check if the object is empty 
async function isEmpty(obj) {
    if (Object.keys(obj).length == 0) {
        return 'The object is empty';
    };
};

//Check if all keys exist and the values are valid
async function AllKeysExistAndValid(obj, arrayOfObjects) {
    for (let i = 0; i < arrayOfObjects.length; i++) {
        if (!Object.keys(obj).includes(Object.keys(arrayOfObjects[i]))) {
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


// לאה יקרה!!
// בסיום השיעור תתקשרי אלי לפני שאת מתחילה לעבוד ולפני שאת פותחת לבדוק מה עשיתי
// תודה מראש!!!!!!!














// async function isPerfect(obj) {
//     let { tableName, columns, values } = obj;
//     let array1 = columns.split(',');
//     let array2 = values.split(',');
//     console.log(array1, array2);
//     let newObj = config.find(a => { return Object.keys(a).includes('sql'); });
//     newObj = newObj['sql'].find(b => { return Object.keys(b).includes('Tables'); });
//     newObj = newObj['Tables'].find(c => { return Object.values(c['MTDTable']['name']).includes(tableName) })['columns'];
//     newObj.forEach(d => {
//         if (Object.values(d['type']).includes('NOT NULL')) {
//             if (array1.includes(Object.values(d['name']))) {
//                 return `The ${Object.values(d['name'])} is required to be filled`
//             }
//             let index = array1.indexOf(Object.values(d['name']));
//             if (Object.values(d['type']).includes('INT') || Object.values(d['type']).includes('FLOAT')) {
//                 if (typeof (array2[index]) != 'number') {
//                     return `The ${array2[index]} value must be a number`
//                 }
//             }
//             if (Object.values(d['type']).includes('NVARCHAR') || Object.values(d['type']).includes('DATE')) {
//                 if (typeof (array2[index]) != 'string') {
//                     return `The ${array2[index]} value must be a string`
//                 }
//                 let start = Object.values(d['type']).indexOf('(');
//                 let end = Object.values(d['type']).indexOf(')');
//                 let max = parseInt(Object.values(d['type']).substring(start + 1, end));
//                 if (Object.values(d['type']).includes('NVARCHAR') && array2[index].length > max) {
//                     return `The ${array2[index]} is limited to ${max} characters`
//                 }
//             }
//         }

//     });
// }

module.exports = { checkObjRead, checkObjReadAll, checkObjCreate };
