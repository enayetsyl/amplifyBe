const breakoutRoomController = require("../controllers/breakoutroomController");

module.exports = function (app) {
  app.post("/create-breakout-room", breakoutRoomController.createBreakoutRoom);
  app.put(
    "/update-breakout-room/:id",
    breakoutRoomController.updateBreakoutRoom
  );
  app.delete(
    "/delete-breakout-room/:id",
    breakoutRoomController.deleteBreakoutRoom
  );
  app.get("/get-breakout-room/:id", breakoutRoomController.getBreakoutRoom);
  app.get(
    "/get-all-breakout-rooms",
    breakoutRoomController.getAllBreakoutRooms
  );
};
