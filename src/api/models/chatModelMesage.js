const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');

const chatSchema=mongoose.Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    message:{
        type:String,
        require:true,
    },
    receiver_id:{
        type:String,
        require:true,
    },
},
{timestamps:true})
module.exports=mongoose.model('Chat',chatSchema);