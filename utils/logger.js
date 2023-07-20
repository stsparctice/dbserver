

function routerLogger(){
    return (req, res, next)=>{
        const {hostname,port,baseUrl, url,query, body} = req
        console.log({hostname,port,baseUrl,url,query, body})
        next()
    }
}

module.exports={routerLogger}