const controller = require("../controllers/projectController");

module.exports = function (app) {
  app.post("/api/create/contact", controller.createContact);
  app.get("/api/get/contact-id", controller.getContactById);
  app.get("/api/get-all/contact", controller.getAllContacts);
  app.put("/api/update-contact", controller.updateContact);
  app.delete("/api/delete/contact/:id", controller.deleteContact);
};
