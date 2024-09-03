const controller = require("../controllers/meetingController");

module.exports = function (app) {
  app.post("/api/create/meeting", controller.createMeeting);
  // app.get("/api/get/meeting-id", controller.getMeetingById);
  app.get("/api/get-all/meeting/:projectId", controller.getAllMeetings);
  // app.put("/api/update-meeting", controller.updateMeeting);
  // app.delete("/api/delete/meeting/:id", controller.deleteMeeting);
};
