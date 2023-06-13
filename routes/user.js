var express = require('express');
var router = express.Router();
const userController = require('../app/controllers/userController');
const userMiddlewares = require('../middlewares/userMiddlewares');

require('dotenv').config(); // Module to Load environment variables from .env file



/*=======================================MIDDLEWARES=======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyUserLogin = userMiddlewares.verifyUserLogin;


/*=================================================USER ROUTES=================================================*/


/* ========================HOME page======================== */

router.get('/', userController.homePageGET);


/* ========================USER LOGIN / LOGOUT ROUTES======================== */

router.get('/login', userController.userLogInGET);

router.post('/login', userController.userLogInPOST);

router.post('/logout', verifyUserLogin, userController.userLogOutPOST);


/* ========================USER SIGN-UP ROUTES======================== */

router.get('/signup', userController.userSignUpGET);

router.post('/signup', userController.userSignUpPOST);

router.get('/verify-user-signup', userController.verifyUserSignUpGET);

router.post('/verify-user-signup', userController.verifyUserSignUpPOST);


/* ========================Single Product Page Route======================== */

router.get('/product-details/:id', userController.singleProductPageGET);


/* ========================CART ROUTES======================== */

router.get('/cart', verifyUserLogin, userController.cartGET);

router.get('/empty-cart', verifyUserLogin, userController.emptyCartGET);

router.get('/add-to-cart/:id', verifyUserLogin, userController.addToCartGET);

router.post('/change-product-quantity', verifyUserLogin, userController.changeCartProductQuantityPOST);

router.post('/delete-product-from-cart', verifyUserLogin, userController.deleteCartProductPOST);


/* ========================ORDERS & PAYMENTS ROUTES======================== */

router.get('/orders',verifyUserLogin, userController.userOrdersGET);

router.post('/ordered-product-details',verifyUserLogin, userController.userOrderDetailsPOST);

router.get('/place-order',verifyUserLogin, userController.placeOrderGET);

router.post('/place-order',verifyUserLogin, userController.placeOrderPOST)

router.get('/order-success',verifyUserLogin, userController.orderSuccessGET);

router.get('/order-failed',verifyUserLogin, userController.orderFailedGET);

router.post('/verify-payment',verifyUserLogin, userController.verifyPaymentPOST);

router.post('/save-payment-data',verifyUserLogin, userController.savePaymentDataPOST);






module.exports = router;
