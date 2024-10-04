const controller = require("../controllers/repositoryController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

module.exports = function (app) {
  app.post("/api/create/repository", upload.single('file'), controller.createRepository);
  app.get("/api/get-repository/:projectId", controller.getRepositoryByProjectId);
  app.put("/api/rename-file/:id", controller.renameFile);
  app.delete("/api/delete-file/:id", controller.deleteFile);
};

