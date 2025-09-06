const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    data:{
        type:Object,

    },
    attachement:{
        type:String,

    },
    topic:{
        type:String
    }
});


const UserModel =  mongoose.model("User",UserSchema);
module.exports = UserModel;