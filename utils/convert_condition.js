// { AND: [{ Ovligo: 4 }, { OR: [{ City: "אשדוד" }, { City:"בני-ברק" }] }], OR: [{ ZipCode: "77452" }, { ZipCode: "74522" }] ,Shores:"jdhf"}
// { AND: [{ Ovligo: 4 }, { OR: [{ City: "אשדוד" },{OR:[{jorg:"kdjf"},{AND:[{SARIT:5},{kdjj:"jdhjfa"}]}]} ,{ City:"בני-ברק" }] }], OR: [{ ZipCode: "77452" }, { ZipCode: "74522" }] ,Shores:"jdhf"}


const convertToSqlQuery = (condition) => {
    const buildQuery = (condition, operator) => {
        let query = ``
        for (let key in condition) {
            if (key === 'AND') {
                query = `${query} (${buildOrAnd(condition[key],"AND")}) ${operator}`;
            }
            else {
                if (key === 'OR') {
                    query = `${query} (${buildOrAnd(condition[key],"OR")}) ${operator}`;
                }
                else {
                    query = `${query} ${key} = ${typeof condition[key] === 'string' ? `'${condition[key]}'` : condition[key]} ${operator}`;
                }
            }
        }
        return query;

    }
    const buildOrAnd = (array,operator) => {
        let query = ``;
        for (let item of array) {
            if (array.indexOf(item) === array.length - 1) {
                query = `${query} ${buildQuery(item, "")}`
            }
            else
                query = `${query} ${buildQuery(item, operator)}`
        }
        return query;
    }
    let result = buildQuery(condition, "AND");
    result = result.slice(0, result.length - 3);
    console.log({result});
    return result; 
}
const convertToMongoFilter = () => {

}
module.exports = { convertToMongoFilter, convertToSqlQuery }
