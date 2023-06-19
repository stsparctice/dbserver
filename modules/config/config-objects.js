const types = {

    NVARCHAR: {
        typeNodeName: 'string',
        parseNodeTypeToSqlType: (string) => {
            return `'${string}'`
        }
    },

    BIT: {
        typeNodeName: 'boolean',
        parseNodeTypeToSqlType: (boolean) => {
            return `'${boolean}'`
        }
    },

    DATETIME: {
        typeNodeName: 'Date',
        parseNodeTypeToSqlType: (Date) => {
            return `'${Date}'`
        }
    },

    INT: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            return number
        }
    }
}


module.exports = types

