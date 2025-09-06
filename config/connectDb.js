const mongoose = require('mongoose')


 function connectDb() {
    try{
     mongoose.connect(process.env.MONGO_URI)
        .then((res)=>console.log("mongoose connected to: ",res.connection.host) )
        
    }catch(err){
        console.log(err.message);
    }
}
module.exports = connectDb;