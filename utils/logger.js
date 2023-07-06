

function routerLogger(){
    return (req, res, next)=>{
        const {hostname,port,baseUrl, url, body} = req
        // console.log({hostname,port,bas eUrl,url, body})
        next()
    }
}

module.exports={routerLogger}