const controller = require("../controllers/chatController");


module.exports = function (app) {
  app.post("/api/chat-message/save", controller.saveChatMessage);
  app.get("/api/get-chat/:meeting-id", controller.getMeetingChatById);
}


