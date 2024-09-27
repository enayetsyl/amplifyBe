const express = require('express');
const router = express.Router();
const { createUserRole, getUserRoleById } = require('../controllers/userMettJoinController');

// POST route to create a new user role
router.post('/user-role', createUserRole);

// GET route to fetch a user role by ID
router.get('/user-role/:id', getUserRoleById);

module.exports = router;
