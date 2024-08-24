const controller = require("../controllers/contactController");

module.exports = function (app) {
  app.post("/api/create/contact", controller.createContact);
  app.get("/api/get/contact-id", controller.getContactById);
  app.get("/api/get-all/contact", controller.getAllContacts);
  app.get("/api/get-all/contact/:id", controller.getContactsByUserId);
  app.put("/api/update-contact/:id", controller.updateContact);
  app.delete("/api/delete/contact/:id", controller.deleteContact);
};
