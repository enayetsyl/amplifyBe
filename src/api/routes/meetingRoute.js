const controller = require("../controllers/meetingController");

module.exports = function (app) {
  app.post("/api/create/meeting", controller.createMeeting);
  // app.get("/api/get/meeting-id", controller.getMeetingById);
  app.get("/api/get-all/meeting/:projectId", controller.getAllMeetings);
  app.post("/api/verify-meeting-passcode", controller.verifyModeratorMeetingPasscode);
};
