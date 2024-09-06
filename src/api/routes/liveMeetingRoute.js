const controller = require("../controllers/liveMeetingController");

module.exports = function(app) {
  app.post("/api/live-meeting/start-meeting", controller.startMeeting);
  app.post("/api/live-meeting/join-meeting-participant", controller.joinMeetingParticipant);
  app.post("/api/live-meeting/join-meeting-observer", controller.joinMeetingObserver);
  app.get("/api/live-meeting/waiting-list/:meetingId", controller.getWaitingList);
  app.put("/api/live-meeting/accept-from-waiting-list", controller.acceptFromWaitingRoom);
  app.get("/api/live-meeting/participant-list/:meetingId", controller.getParticipantList);
  app.get("/api/live-meeting/observer-list/:meetingId", controller.getObserverList);
  app.get("/api/live-meeting/get-meeting-status/:meetingId", controller.getMeetingStatus);
  app.post("/api/live-meeting/send-message-to-participant", controller.participantSendMessage);
  app.get("/api/live-meeting/get-participant-chat/:meetingId", controller.getParticipantChat);
  app.get("/api/live-meeting/get-observer-chat/:meetingId", controller.getObserverChat);
  app.post("/api/live-meeting/send-message-to-observer", controller.observerSendMessage);
  app.put("/api/live-meeting/remove-participant-from-meeting", controller.removeParticipantFromMeeting);
  app.put("/api/live-meeting/participant-left-from-meeting", controller.participantLeaveFromMeeting);
  app.get("/api/live-meeting/get-webrtc-meeting-id/:meetingId", controller.getWebRtcMeetingId);
  app.get("/api/live-meeting/get-iframe-link/:meetingId", controller.getIframeLink);
  app.get("/api/live-meeting/get-removed-participants-list/:meetingId", controller.getRemovedParticipantsList);
}