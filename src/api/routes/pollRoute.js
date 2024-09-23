const controller = require("../controllers/pollController");

module.exports = function (app) {
  app.post("/api/create/poll", controller.createPoll);
  app.get("/api/get/poll-id/:id", controller.getPollById);
  app.get("/api/get-all/poll/:projectId", controller.getAllPolls);
  app.put("/api/update-poll/:id", controller.updatePoll);
  app.delete("/api/delete/poll/:id", controller.deletePoll);
};
