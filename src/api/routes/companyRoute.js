const companyController = require("../controllers/companyController");

module.exports = function (app) {
  app.post("/create-company", companyController.createCompany);
  app.put("/update-company/:id", companyController.updateCompany);
  app.delete("/delete-company/:id", companyController.deleteCompany);
  app.get("/get-company/:id", companyController.getCompany);
  app.get("/get-all-companies", companyController.getAllCompanies);
};
