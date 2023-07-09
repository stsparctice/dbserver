const convertToSQLString = (value) => {
    console.log({ value })
    let special = ["'", "&", "%", "#", "$"]
    const sqlStrings = []
    const split = value.split('')
    if (split.some(ch => special.includes(ch))) {
        console.log({ split })
        for (let i = 0; i < split.length; i++) {
        let word=''
            console.log({ i })
            while (i < split.length && special.indexOf(split[i]) == -1) {
                console.log({i, val:split[i]})
                word += split[i]
                i++
            }
            sqlStrings.push(`N'${word}'`)
            console.log(` ${word}'`)
            if (i < split.length && special.indexOf(split[i]) != -1) {
                sqlStrings.push(`char(${split[i].charCodeAt()})`)
            }
        }

        const concat = `concat(${sqlStrings.join(',')})`
        return concat
    }

    return `'${value}'`
}


const types = {

    NVARCHAR: {

        typeNodeName: 'string',
        parseNodeTypeToSqlType: (value) => {
            return convertToSQLString(value)
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
    },
    REAL: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            return number
        }
    },
    FLOAT: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            return number
        }
    }
}


module.exports = types

