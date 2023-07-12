// { AND: [{ Ovligo: 4 }, { OR: [{ City: "אשדוד" }, { City:"בני-ברק" }] }], OR: [{ ZipCode: "77452" }, { ZipCode: "74522" }] ,Shores:"jdhf"}
// { AND: [{ Ovligo: 4 }, { OR: [{ City: "אשדוד" },{OR:[{jorg:"kdjf"},{AND:[{SARIT:5},{kdjj:"jdhjfa"}]}]} ,{ City:"בני-ברק" }] }], OR: [{ ZipCode: "77452" }, { ZipCode: "74522" }] ,Shores:"jdhf"}


const convertToSqlQuery = (condition) => {
    const buildQuery = (condition, operator) => {
        let query = ``
        for (let key in condition) {
            if (key === 'AND') {
                query = `${query} (${buildAnd(condition[key])}) ${operator}`;
            }
            else {
                if (key === 'OR') {
                    query = `${query} (${buildOr(condition[key])}) ${operator}`;
                }
                else {
                    query = `${query} ${key} = ${typeof condition[key] === 'string' ? `'${condition[key]}'` : condition[key]} ${operator}`;
                }
            }
        }
        return query;

    }
    const buildAnd = (andArray) => {
        let andQuery = ``;
        for (let and of andArray) {
            if (andArray.indexOf(and) === andArray.length - 1) {
                andQuery = `${andQuery} ${buildQuery(and, "")}`
            }
            else
                andQuery = `${andQuery} ${buildQuery(and, "AND")}`
        }
        return andQuery;
    }
    const buildOr = (orArray) => {
        let orQuery = ``
        for (let or of orArray) {
            if (orArray.indexOf(or) === orArray.length - 1)
                orQuery = `${orQuery} ${buildQuery(or, "")}`
            else
                orQuery = `${orQuery} ${buildQuery(or, "OR")}`

        }
        return orQuery;
    }
    let result = buildQuery(condition, "AND")
    result = result.slice(0, result.length - 3)
    return result;
}
const convertToMongoFilter = () => {

}
module.exports = { convertToMongoFilter, convertToSqlQuery }
