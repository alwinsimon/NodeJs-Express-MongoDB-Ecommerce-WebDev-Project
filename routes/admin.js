const express = require('express');
const router = express.Router();
const adminMiddlewares = require('../middlewares/adminMiddlewares');
const adminController = require('../app/controllers/adminController');
const productController = require('../app/controllers/productController');
const couponController = require('../app/controllers/couponController');
const offerController = require('../app/controllers/offerController');


/*=======================================MIDDLEWARES=======================================*/

// Middleware to verify if the requests are made by admin
const verifyAdminLogin = adminMiddlewares.verifyAdminLogin;


/*=================================================ADMIN ROUTES=================================================*/

// ====================Route to Admin Dashboard====================
router.get('/', verifyAdminLogin, adminController.adminDashboardGET);


/* ========================LOGIN & LOGOUT ROUTES======================== */

router.get('/login', adminController.logInGET);

router.post('/login', adminController.logInPOST);

router.post('/logout', adminController.logOutPOST);


/* ====================Routes to Add New Admin==================== */

router.get('/add-admin', verifyAdminLogin, adminController.addNewAdminGET);

router.post('/add-admin', verifyAdminLogin, adminController.addNewAdminPOST);


// ====================Routes to Manage Users====================

router.get('/manage-users', verifyAdminLogin, adminController.manageUsersGET);

router.post('/change-user-status', verifyAdminLogin, adminController.changeUserStatusPOST);


/* ========================================================PRODUCT ROUTES======================================================== */

// ====================Route to Manage Products====================

router.get('/manage-products', verifyAdminLogin, productController.manageProductsGET);


// ====================Route to Add NEW Product Page====================

router.get('/add-product', verifyAdminLogin, productController.addProductGET);

router.post('/add-product', verifyAdminLogin, productController.addProductPOST);


// ====================Route to DELETE a PRODUCT====================

router.get('/delete-product/:id', verifyAdminLogin, productController.deleteProductGET);


// ====================Routes to EDIT a PRODUCT====================

router.get('/edit-product/:id', verifyAdminLogin, productController.editProductGET);

router.post('/edit-product/:id', verifyAdminLogin, productController.editProductPOST);


// ====================Routes for PRODUCT CATEGORIES====================

router.get('/manage-product-categories', verifyAdminLogin, productController.productCategoriesGET);

router.get('/add-new-product-category', verifyAdminLogin, productController.addProductCategoryGET);

router.post('/add-new-product-category', verifyAdminLogin, productController.addProductCategoryPOST);

router.get('/edit-product-category/:categoryId', verifyAdminLogin, productController.editProductCategoryGET);

router.post('/edit-product-category/:categoryId', verifyAdminLogin, productController.editProductCategoryPOST);

router.post('/delete-product-category/:categoryId', verifyAdminLogin, productController.deleteProductCategoryPOST);


// ====================Routes for Coupon Management ====================

router.get('/manage-coupons', verifyAdminLogin, couponController.manageCouponGET);

router.get('/add-coupon', verifyAdminLogin, couponController.addNewCouponGET);

router.post('/add-coupon', verifyAdminLogin, couponController.addNewCouponPOST);

router.get('/edit-coupon/:couponId', verifyAdminLogin, couponController.editCouponGET);

router.post('/update-coupon', verifyAdminLogin, couponController.updateCouponPOST);

router.post('/change-coupon-status', verifyAdminLogin, couponController.changeCouponStatusPOST);

router.get('/inactive-coupons', verifyAdminLogin, couponController.inactiveCouponsGET );


// ====================Routes for Offer Management ====================

router.get('/manage-offers', verifyAdminLogin, offerController.manageOfferGET);

router.get('/add-offer', verifyAdminLogin, offerController.addNewOfferGET);

router.post('/add-offer', verifyAdminLogin, offerController.addNewOfferPOST);

router.get('/edit-offer/:offerName', verifyAdminLogin, offerController.editOfferGET);

router.post('/update-offer', verifyAdminLogin, offerController.updateOfferPOST);

router.post('/change-offer-status', verifyAdminLogin, offerController.changeOfferStatusPOST);

router.get('/inactive-offers', verifyAdminLogin, offerController.inactiveOffersGET);


// ====================Routes for Managing Orders====================

router.get('/order-summary', verifyAdminLogin, adminController.manageOrdersGET);

router.post('/single-order-details', verifyAdminLogin, adminController.singleOrderDetailsPOST);


// ====================Routes for Managing ORDER STATUS====================

router.post('/change-order-status', verifyAdminLogin, adminController.changeOrderStatusPOST);


// ====================Routes for Managing Order CANCELLATION====================

router.post('/review-order-cancellation-request', verifyAdminLogin, adminController.orderCancellationPOST);

router.post('/approve-order-cancellation-request', verifyAdminLogin, adminController.approveOrderCancellationPOST);

router.post('/reject-order-cancellation-request', verifyAdminLogin, adminController.rejectOrderCancellationPOST);

router.post('/admin-side-order-cancellation', verifyAdminLogin, adminController.adminSideOrderCancellationPOST);


// ====================Routes for Managing Order RETURN REQUESTS====================

router.post('/review-order-return-request', verifyAdminLogin, adminController.reviewOrderReturnRequestPOST);

router.post('/change-order-return-status', verifyAdminLogin, adminController.changeOrderReturnStatusPOST);





/* ======================== Access Forbidden page======================== */

router.get('/access-forbidden', adminController.adminAccessForbiddenPageGET);

/* ======================== Error handling page======================== */

router.get('/error-page', adminController.adminErrorHandlerPageGET);







module.exports = router;
