// routes/meetingRoutes.js
const express = require('express');
const router = express.Router();
const { addParticipant, removeParticipant } = require('../controllers/meetUserController');

// POST route to add a participant
router.post('/add-participant', addParticipant);

// POST route to remove a participant
router.post('/remove-participant', removeParticipant);

module.exports = router;
