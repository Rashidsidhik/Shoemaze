const  MongoClient  = require("mongodb").MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
    const url="mongodb+srv://rashidps44:eKqrd1QvKeyq4p7d@cluster0.0i0pqds.mongodb.net/?retryWrites=true&w=majority"
    const dbname='userdata'

    MongoClient.connect(url,(err,data)=>{
        if(err)return done(err)
        state.db=data.db(dbname)
    })
    done()
}

module.exports.get=function(){
    return state.db
}