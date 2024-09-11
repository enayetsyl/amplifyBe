const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", false);

// Adding connection options to increase the timeout
const options = {
  serverSelectionTimeoutMS: 50000,  // Time to wait for server selection in ms (increased to 50 seconds)
  socketTimeoutMS: 45000,           // Timeout for socket operations (increased to 45 seconds)
  connectTimeoutMS: 30000,          // Time to wait for initial connection (increased to 30 seconds)
};

mongoose
  .connect(process.env.MONGO_URI, options)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
  });
