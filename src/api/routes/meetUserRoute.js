// routes/meetingRoutes.js
const express = require("express");
const router = express.Router();
const { addParticipant,removeParticipant,getUserDetailsBySlug} = require("../controllers/meetUserController");

// POST route to add a participant
router.post("/add-participant", addParticipant);
// POST route to remove a participant
router.post('/remove-participant', removeParticipant);
// GET route to get user details by slug
router.get('/user-details/:slug', getUserDetailsBySlug);

module.exports = router;
