const express = require('express');
const router = express.Router();
const {authenticateUser,
    authorizePermissions
    }    = require('../middleware/authentication')
const {
    getAllUser,
    getSingleUser,
    showMe,
    updateUserPassword,
    userUpdate
} = require('../controllers/userControllers');

router.route('/').get(authenticateUser, authorizePermissions('admin'),getAllUser)
router.route('/showMe').get(authenticateUser, showMe)
router.route('/updatePassword').patch(authenticateUser, updateUserPassword)
router.route('/userUpdate').patch(authenticateUser, userUpdate)
router.route('/:id').get(authenticateUser, getSingleUser)


module.exports = router;