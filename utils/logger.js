

function routerLogger(){
    return (req, res, next)=>{
        const {baseUrl, url, body} = req
        console.log({baseUrl,url, body})
        next()
    }
}

module.exports={routerLogger}