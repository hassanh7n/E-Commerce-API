const express = require('express');
const router = express.Router()
const {authenticateUser
    }    = require('../middleware/authentication')
const {
    register,
    logIn,
    logOut,
    verifyEmail,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');


router.route('/register').post(register)
router.route('/login').post(logIn)
router.route('/logout').delete(authenticateUser, logOut)
router.route('/verify-email').post(verifyEmail);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);


module.exports = router;