const controller = require("../controllers/addAdminController");

module.exports = function (app) {
  app.post("/api/create/admin", controller.createAdmin);
  app.get("/api/get/admin", controller.getAdmin);
  app.get("/api/get-all/admin", controller.getAllAdmins);
  app.put("/api/update-admin", controller.updateAdmin);
  app.delete("/api/delete/admin", controller.deleteAdmin);
};
