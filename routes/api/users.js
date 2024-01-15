const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/usersController');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/')
    .get(verifyJWT, usersController.getAllUsers)
    .put(usersController.updateUser)
    .delete(usersController.deleteUser);

router.route('/:id')
    .get(usersController.getUser)
    .put(usersController.updateUser)
    .delete(usersController.deleteUser);

module.exports = router;
