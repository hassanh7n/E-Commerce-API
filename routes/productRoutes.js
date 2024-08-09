const express = require('express');
const router = express.Router();
const {authenticateUser,
    authorizePermissions
    }    = require('../middleware/authentication')
const  {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
} = require('../controllers/ProductControllers');
const {getSingleProductReviews} = require('../controllers/reviewController');


router.route('/').get(getAllProducts);

router.route('/:id').get(getSingleProduct);


router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('admin')],uploadImage);

router.route('/:id').patch([authenticateUser, authorizePermissions('admin')], updateProduct);

router.route('/').post([authenticateUser, authorizePermissions('admin')], createProduct);

router.route('/:id').delete([authenticateUser, authorizePermissions('admin')], deleteProduct)

router.route('/reviews/:id').get(getSingleProductReviews);




module.exports = router