var express = require('express');
var router = express.Router();

/* ======================== Middlewares ======================== */
const userMiddlewares = require('../middlewares/userMiddlewares');

/* ======================== Controllers ======================== */
const userController = require('../app/controllers/userController');
const couponController = require('../app/controllers/couponController');



/*=======================================MIDDLEWARES=======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyUserLogin = userMiddlewares.verifyUserLogin;


/*=================================================USER ROUTES=================================================*/


/* ========================HOME page======================== */

router.get('/', userController.homePageGET);


/* ========================Category Product Page Route======================== */

router.get('/category/:categoryName', userController.categoryWiseProductsGET);


/* ========================Single Product Page Route======================== */

router.get('/product-details/:id', userController.singleProductPageGET);


/* ========================USER LOGIN / LOGOUT ROUTES======================== */

router.get('/login', userController.userLogInGET);

router.post('/login', userController.userLogInPOST);

router.post('/logout', verifyUserLogin, userController.userLogOutPOST);


/* ========================USER SIGN-UP ROUTES======================== */

router.get('/signup', userController.userSignUpGET);

router.post('/signup', userController.userSignUpPOST);

router.get('/verify-user-signup', userController.verifyUserSignUpGET);

router.post('/verify-user-signup', userController.verifyUserSignUpPOST);

router.get('/resend-otp', userController.reSendUserSignUpOTPGET);

router.post('/resend-otp', userController.requestToReSendUserSignUpOTPPOST);


/* ========================USER FORGOT PASSWORD ROUTES======================== */

router.get('/forgot-password', userController.forgotPasswordGET);

router.post('/forgot-password', userController.verifyAccountForPasswordResetPOST);

router.get('/password-reset-otp', userController.verifyOTPForPasswordResetGET);

router.post('/password-reset-otp', userController.verifyOTPForPasswordResetPOST);

router.post('/set-new-password', userController.resetUserPasswordPOST);


/* ========================USER PROFILE ROUTES======================== */

router.get('/profile/:userName', verifyUserLogin, userController.userProfileGET);

router.post('/update-my-profile', verifyUserLogin, userController.userProfileUpdateRequestPOST);


/* ========================USER ADDRESS ROUTES======================== */

router.get('/manage-my-address', verifyUserLogin, userController.manageUserAddressGET);

router.post('/add-new-address', verifyUserLogin, userController.addNewAddressPOST);

router.post('/update-user-primary-address', verifyUserLogin, userController.changePrimaryAddressPOST);

router.post('/edit-user-address', verifyUserLogin, userController.editUserAddressPOST);

router.post('/delete-user-address', verifyUserLogin, userController.deleteUserAddressPOST);


/* ========================Wishlist Route======================== */

router.get('/wishlist', verifyUserLogin, userController.userWishlistGET);

router.post('/modify-wishlist', verifyUserLogin, userController.modifyUserWishlistPOST);


/* ========================CART ROUTES======================== */

router.get('/cart', verifyUserLogin, userController.cartGET);

router.get('/empty-cart', verifyUserLogin, userController.emptyCartGET);

router.get('/add-to-cart/:id', verifyUserLogin, userController.addToCartGET);

router.post('/change-product-quantity', verifyUserLogin, userController.changeCartProductQuantityPOST);

router.post('/delete-product-from-cart', verifyUserLogin, userController.deleteCartProductPOST);


/* ========================COUPON ROUTES======================== */

router.post('/apply-coupon-request', verifyUserLogin, couponController.applyCouponPOST);


/* ========================ORDERS ROUTES======================== */

router.get('/orders',verifyUserLogin, userController.userOrdersGET);

router.post('/ordered-product-details',verifyUserLogin, userController.userOrderDetailsPOST);

router.get('/place-order',verifyUserLogin, userController.placeOrderGET);

router.post('/place-order',verifyUserLogin, userController.placeOrderPOST)

router.get('/order-success',verifyUserLogin, userController.orderSuccessGET);

router.get('/order-failed',verifyUserLogin, userController.orderFailedGET);


/* ========================PAYMENTS ROUTES======================== */

router.post('/verify-payment',verifyUserLogin, userController.verifyPaymentPOST);

router.post('/save-payment-data',verifyUserLogin, userController.savePaymentDataPOST);


/* ========================ORDERS CANCELLATION ROUTES======================== */

router.post('/order-cancellation-request',verifyUserLogin, userController.orderCancellationRequestPOST);


/* ========================ORDERS RETURN ROUTES======================== */

router.post('/order-return-request',verifyUserLogin, userController.orderReturnRequestPOST);


/* ======================== Access Forbidden page======================== */

router.get('/access-forbidden', userController.accessForbiddenPageGET);

/* ======================== Error handling page======================== */

router.get('/error-page', userController.errorHandlerPageGET);






module.exports = router;
