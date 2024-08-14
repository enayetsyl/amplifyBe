const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./src/config/db.config.js");

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));

// Routes
require("./src/api/routes/userRoute.js")(app);//done--tested
require("./src/api/routes/pollRoute.js")(app);//done--tested
require("./src/api/routes/projectRoute.js")(app);//done--tested
require("./src/api/routes/contactRoute.js")(app);//done--tested
require("./src/api/routes/meetingLinkRoute.js")(app);//not made or presnt in Original Module--rehman integrated
require("./src/api/routes/addAdminRoute.js")(app);//pending UI--not Initiated
require("./src/api/routes/moderatorInvitationRoute.js")(app);//done
require("./src/api/routes/breakoutroomRoutes.js")(app);//done -- 1api pending
require("./src/api/routes/videoRoute.js")(app);//pending UI--Dependency WebRTC
require("./src/api/routes/companyRoute.js")(app);//pending UI--not Inititiate

let port = process.env.PORT || 8008;
app.listen(port, () => {
  console.log(`server app listening on port http://localhost:${port}`);
});
