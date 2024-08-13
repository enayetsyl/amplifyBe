const controller = require("../controllers/meetingLinkController");

module.exports = function (app) {
  app.post("/api/send/link", controller.createMeetingLink);
  app.get("/api/get/participants", controller.getMeetingLink);
  app.get("/api/get-all/participants", controller.getAllMeetingLinks);
  app.put("/api/update-link", controller.updateMeetingLink);
  app.delete("/api/delete/link", controller.deleteMeetingLink);
};
