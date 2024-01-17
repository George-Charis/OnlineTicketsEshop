const express = require('express');
const router = express.Router();
const path = require('path');
const forgotPasswordController = require('../controllers/forgotPasswordController');
const verifyResetToken = require('../middleware/verifyResetToken');

router.post('/', forgotPasswordController.handleForgotPassword);

router.route('/:resetToken')
    .get(verifyResetToken, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'views', 'changePassword.html'));
    })
    .post(verifyResetToken,forgotPasswordController.changePassword);



module.exports = router;