const controller = require("../controllers/moderatorInvitationController");

module.exports = function (app) {
  app.post("/api/moderator-invitation/link", controller.createModerator);
  app.get("/api/get/moderator", controller.getModerator);
  app.get("/api/get-all/moderator", controller.getAllModerators);
  app.put('/api/update/moderator/:id', controller.updateModerator);
  app.delete("/api/delete/moderator", controller.deleteModerator);
};
