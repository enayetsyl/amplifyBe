const meetingRecordingController = require("../controllers/videoController");

module.exports = function (app) {
  app.post(
    "/create-meeting-recording",
    meetingRecordingController.upload,
    meetingRecordingController.createMeetingRecording
  );
  app.put(
    "/update-meeting-recording/:id",
    meetingRecordingController.upload,
    meetingRecordingController.updateMeetingRecording
  );
  app.delete(
    "/delete-meeting-recording/:id",
    meetingRecordingController.deleteMeetingRecording
  );
  app.get(
    "/get-meeting-recording/:id",
    meetingRecordingController.getMeetingRecording
  );
  app.get(
    "/get-all-meeting-recordings",
    meetingRecordingController.getAllMeetingRecordings
  );
};
