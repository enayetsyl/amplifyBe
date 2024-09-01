const controller = require("../controllers/liveMeetingController");

module.exports = function(app) {
  app.post("/api/live-meeting/start-meeting", controller.startMeeting);
  app.post("/api/live-meeting/join-meeting-participant", controller.joinMeetingParticipant);
  app.post("/api/live-meeting/join-meeting-observer", controller.joinMeetingObserver);
}