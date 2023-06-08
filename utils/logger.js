

function routerLogger(){
    return (req, res, next)=>{
        const {url, body} = req
        console.log({url, body})
        next()
    }
}

module.exports={routerLogger}