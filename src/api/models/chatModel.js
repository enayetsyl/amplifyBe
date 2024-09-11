const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');


const ChatMessageSchema = new mongoose.Schema({
    senderName: {
      type: String,
      required: true
    },
    receiverName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  }, { timestamps: true });
  
  const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

  module.exports = ChatMessage;


// const chatSchema=mongoose.Schema({
//     sender_id:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"User",
//     },
//     message:{
//         type:String,
//         require:true,
//     },
//     receiver_id:{
//         type:String,
//         require:true,
//     },
// },
// {timestamps:true})
// module.exports=mongoose.model('Chats',chatSchema);