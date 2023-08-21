const convertToSQLString = (value) => {
    if (value === undefined || value === null) return '';

    if (typeof value !== 'string') throw new Error('value must be a string');
    let special = ["'", "&", "%", "#", "$"];
    const sqlStrings = [];
    const split = value.split('');
    if (split.some(ch => special.includes(ch))) {
        for (let i = 0; i < split.length; i++) {
            let word = '';
            while (i < split.length && special.indexOf(split[i]) == -1) {
                word += split[i];
                i++;
            }
            sqlStrings.push(`N'${word}'`);
            if (i < split.length && special.indexOf(split[i]) != -1) {
                sqlStrings.push(`char(${split[i].charCodeAt()})`);
            }
        }
        const concat = `concat(${sqlStrings.join(',')})`;
        return concat;
    };
    return `N'${value}'`
};

const isValueSent = (value) => {
    if (value === null)
        console.log({ value })
    if (value === undefined) throw new Error('value is required');
};

const types = {
    NVARCHAR: {
        typeNodeName: 'string',
        parseNodeTypeToSqlType: (value) => {
            try {
                return convertToSQLString(value);
            }
            catch (err) { throw err; };
        }
    },

    BIT: {
        typeNodeName: 'boolean',
        parseNodeTypeToSqlType: (boolean) => {
            try {
                if (boolean) {
                    return `'${boolean}'`;
                }
                else {
                    return `'false'`
                }
            }
            catch (err) { throw err; };
        }
    },

    DATETIME: {
        typeNodeName: 'Date',
        parseNodeTypeToSqlType: (Date) => {
            try {
                if (Date) {
                    return `'${Date}'`;
                }
                else{
                    return  
                }
            }
            catch (err) { throw err; }
        }
    },

    INT: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            if (isNaN(number) || number === '')
                return 0;
            else
                return number;
        }
    },

    REAL: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            if (isNaN(number) || number === '')
                return 0;
            else
                return number;
        }
    },

    FLOAT: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            if (isNaN(number) || number === '')
                return 0;
            else
                return number;
        }
    }
};

module.exports = { types, convertToSQLString };
