const fs = require('fs');

// import { logg } from '../files/log'
const { logg } = require('../files/logfile')

// function Log() {
//     console.log("start log");
//     console.log("ppppppppppppppppppppppppppppppppdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd");


//     return (req, res, next) => {
//         let str = ''
//         // console.log("reggg",req);
//         // str = `date= ${new Date},req:${req}`
//         // let urll = "../../jso.json"
//         const { hostname, port, baseUrl, url, body } = req
//         console.log("start return log");
//         console.log({ hostname, port, baseUrl, url, body })
//         str = `\ndate: ${new Date} ,\nhostname: ${hostname} , \nport: ${port} , \nbaseUrl: ${baseUrl} , \nurl: ${url} , \nbody:{ \n\ttableName:${body.tableName} , \n\tcolumns:${body.columns} , \n\tcondition:${body.condition} \n  } `
//         // console.log("strrrrrrrrrrrreeeeeeeeeeeeeeeeeeeeee", str);
//         // arr.push(str)
//         // console.log("sttrrrrgggggggggggggggggggggggggggggggggggggggggggggggggggggffffffffffffffffffffffffffffffffffffffffffffrrr:");
//         logg(str)
//         next()
//     }
// }
function Log(obj) {
    let arr = []

    console.log("start log");
    console.log("ppppppppppppppppppppppppppppppppdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd");

    console.log(obj);
    let str = ''
    let bodyStr=''

    // console.log("reggg",req);
    // str = `date= ${new Date},req:${req}`
    // let urll = "../../jso.json"
    // const { hostname, port, baseUrl, url, body } = obj
    // console.log("start return log");
    // console.log({ hostname, port, baseUrl, url, body })
    // str = `\ndate: ${new Date} ,\nhostname: ${hostname} , \nport: ${port} , \nbaseUrl: ${baseUrl} , \nurl: ${url} , \nbody:{ \n\ttableName:${body.tableName} , \n\tcolumns:${body.columns} , \n\tcondition:${body.condition} \n  } `
    // console.log("strrrrrrrrrrrreeeeeeeeeeeeeeeeeeeeee", str);
    // arr.push(str)
    // bodyStr = ''
    // for (let o of Object.keys(obj.body)) {
    //     console.log(o);
    //     bodyStr += `${o}: ${obj.body[o]}`
    // }    
    // str = `date= ${new Date} ,\nname=${obj.name} ,\npath=${obj.path} ,\nbody=${bodyStr}\n\n`
    // fs.appendFileSync('logger.txt', str)
    obj.forEach(element => {
        console.log(element);
        for (let o of Object.keys(element.body)) {
            console.log(o);
            bodyStr += `${o}: ${element.body[o]}`
        }    
        str += `date= ${new Date} ,\nname=${element.name} ,\npath=${element.path} ,\nbody=${bodyStr}\n\n`

    });
    // if(str.includes("error"))
        logg(str)


}
module.exports = { Log }