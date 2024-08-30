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
const meetuserRoute = require("./src/api/routes/MeetUserRoutes.js");
// Routes
app.use("/meetuser", meetuserRoute);
require("./src/api/routes/userRoute.js")(app);
require("./src/api/routes/pollRoute.js")(app);
require("./src/api/routes/projectRoute.js")(app);
require("./src/api/routes/meetingLinkRoute.js")(app);
require("./src/api/routes/addAdminRoute.js")(app);
require("./src/api/routes/moderatorInvitationRoute.js")(app);
require("./src/api/routes/breakoutroomRoutes.js")(app);
require("./src/api/routes/videoRoute.js")(app);
require("./src/api/routes/companyRoute.js")(app);

let port = process.env.PORT || 8008;
app.listen(port, () => {
  console.log(`server app listening on port http://localhost:${port}`);
});
