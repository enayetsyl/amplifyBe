const controller = require("../controllers/project.controller");

module.exports = function (app) {
  app.post("/api/create/project", controller.createProject);
  app.get("/api/get/project-id", controller.getProjectById);
  app.get("/api/get-all/project", controller.getAllProjects);
  app.put("/api/update-project", controller.updateProject);
  app.delete("/api/delete/project", controller.deleteProject);
};
