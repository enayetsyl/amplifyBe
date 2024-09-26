const controller = require("../controllers/projectController");

module.exports = function (app) {
  app.post("/api/create/project", controller.createProject);
  app.get("/api/get/project-id", controller.getProjectById);
  app.get("/api/get-all/project/:id", controller.getAllProjects);
  app.put("/api/update-project", controller.updateProject);
  app.delete("/api/delete/project/:id", controller.deleteProject);
  // New search API for contacts by first name
  app.get("/api/search/project", controller.searchProjectsByFirstName);
};

// for usage of this search Api
// GET /api/search/contact?firstName=John
