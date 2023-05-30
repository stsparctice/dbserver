const fs = require('fs');
const path = require('path');

async function findSubDirectoriesSync(url) {
    let allData = [];
    let ans = fs.readFileSync(url);
    let arr = ans.toString()
    let arr2 = arr.split('\n')
    let keys = arr2[0].split(',');
    keys[keys.length - 1] = keys[keys.length - 1].split('\r')[0]
    arr2 = arr2.splice(1)
    arr2 = arr2.splice(0, arr2.length - 1)
    arr2.forEach(a => {
        a = a.split('\r')[0]
        let ar = a.split(',')
        let data = {};
        for (let i = 0; i < keys.length; i++) {
            if (/^\d*$/.test(ar[i])) {
                ar[i] = parseInt(ar[i]);
            }
            data[keys[i]] = ar[i];
        }
        allData.push(data)
    })
    // console.log(allData);
    return {keys, allData}
}
module.exports = { findSubDirectoriesSync }