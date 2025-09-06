const mongoose = require('mongoose')


async function connectDb() {
    try{
    const conn =await mongoose.connect(process.env.MONGO_URI)
       console.log("mongoose connected to: ",conn.connection.host) 
       return conn;

        
    }catch(err){
        console.log(err.message);
    }
}
module.exports = connectDb;