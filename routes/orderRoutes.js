const {
    createOrder,
    getAllorders,
    getSingleOrder,
    updateOrder,
    showAllMyOrders
} = require('../controllers/orderController');
const express = require('express');
const {
    authenticateUser,
    authorizePermissions,
  } = require('../middleware/authentication');

const router = express.Router();

router.route('/').get(authenticateUser, authorizePermissions('admin'), getAllorders);
router.route('/showMyorders').get(authenticateUser, showAllMyOrders)
router.route('/:id').get(authenticateUser, getSingleOrder);
router.route('/:id').patch(authenticateUser, updateOrder);
router.route('/').post(authenticateUser, createOrder)



module.exports = router;