const MongoClient = require("mongodb").MongoClient;

const state = {
    db: null,
};

module.exports.connect = function (done) {
    
    const url="mongodb+srv://rashidps44:eKqrd1QvKeyq4p7d@cluster0.0i0pqds.mongodb.net/?retryWrites=true&w=majority"
    // const url = "mongodb://127.0.0.1:27017";
    const dbname = "userdata";

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
        if (err) {
            return done(err);
        }
        
        state.db = client.db(dbname);
        done();
    });
};

module.exports.get = function () {
    return state.db;
};
