

function routerLogger(){
    return (req, res, next)=>{
        // console.log('reqqqqqqqqq',req);
        const {host,port,baseUrl, url, body} = req
        console.log({host,port,baseUrl,url, body})
        next()
    }
}

module.exports={routerLogger}