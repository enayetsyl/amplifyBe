const controller = require("../controllers/creditCardController");

module.exports = function (app) {
  app.post("/api/add/credit-card", controller.addCreditCardInfo);
 
};
