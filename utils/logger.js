

function routerLogger(){
    return (req, res, next)=>{
        const {host,port,baseUrl, url, body} = req
        // console.log({host,port,baseUrl,url, body})
        next()
    }
}

module.exports={routerLogger}