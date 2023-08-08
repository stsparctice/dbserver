const queryOperators = {
    AND: "AND",
    OR: "OR",
    BETWEEN: "BETWEEN",
    STARTWITH: "STARTWITH",
    ENDWITH: "ENDWITH",
    INCLUDES: "INCLUDES",
    GT: "GT",
    LT: "LT",
    GTE: "GTE",
    LTE: "LTE",
    IN: "IN"
}

const DBType = {
    SQL: 'sql', MONGO: 'mongoDB'
}

module.exports = {queryOperators, DBType}