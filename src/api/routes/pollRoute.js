const controller = require("../controllers/pollController");

module.exports = function (app) {
  app.post("/api/create/poll", controller.createPoll);
  app.get("/api/get/poll-id", controller.getPollById);
  app.get("/api/get-all/poll", controller.getAllPolls);
  app.put("/api/update-poll", controller.updatePoll);
  app.delete("/api/delete/poll", controller.deletePoll);
};
