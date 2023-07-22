const express = require('express');
const router = express.Router();
const adminMiddlewares = require('../middlewares/adminMiddlewares');
const adminController = require('../app/controllers/adminController');
const productController = require('../app/controllers/productController');
const couponController = require('../app/controllers/couponController');
const offerController = require('../app/controllers/offerController');
const bannerImageController = require('../app/controllers/adminBannerImageController');
const adminDashboardController = require('../app/controllers/adminDashboardController');
const salesReportController = require('../app/controllers/salesReportController');
const multer = require('../config/imageUploadConfig');


/*=======================================MIDDLEWARES=======================================*/

// Middleware to verify if the requests are made by admin
const verifyAdminLogin = adminMiddlewares.verifyAdminLogin;

// Multer Middlewares to upload images
const multerUploadProductImage = multer.uploadProductImage.array('image');
const multerUploadProductCategoryImage = multer.uploadProductCategoryImage.single('category-image');
const multerUploadBannerImage = multer.uploadBannerImage.single('banner-image');


/*=================================================ADMIN ROUTES=================================================*/


/* ========================LOGIN & LOGOUT ROUTES======================== */

router.get('/login', adminController.logInGET);

router.post('/login', adminController.logInPOST);

router.post('/logout', adminController.logOutPOST);


// ====================Route to Admin Dashboard====================
router.get('/', verifyAdminLogin, adminDashboardController.adminDashboardGET);


// ====================Route to Admin Sales Report====================
router.get('/sales', verifyAdminLogin, salesReportController.salesPageGET);
router.get('/sales/weekly', verifyAdminLogin, salesReportController.weeklySalesPageGET);
router.get('/sales/monthly', verifyAdminLogin, salesReportController.monthlySalesPageGET);
router.get('/sales/yearly', verifyAdminLogin, salesReportController.yearlySalesPageGET);
router.get('/sales/total', verifyAdminLogin, salesReportController.totalSalesPageGET);

router.post('/sales/custom-duration', verifyAdminLogin, salesReportController.getCustomDurationSalesDataPOST);


// ==================== Route to Download Sales Report ====================
router.post('/sales/download-report', verifyAdminLogin, salesReportController.downloadSalesReportPOST);


/* ====================Routes to Add New Admin==================== */

router.get('/add-admin', verifyAdminLogin, adminController.addNewAdminGET);

router.post('/add-admin', verifyAdminLogin, adminController.addNewAdminPOST);


// ====================Routes to Manage Users====================

router.get('/manage-users', verifyAdminLogin, adminController.manageUsersGET);

router.post('/change-user-status', verifyAdminLogin, adminController.changeUserStatusPOST);


/* ========================================================BANNER IMAGE ROUTES======================================================== */

router.get('/banner-image/view', verifyAdminLogin, bannerImageController.viewBannerImagesGET);

router.get('/banner-image/add', verifyAdminLogin, bannerImageController.addBannerImageGET);

router.post('/banner-image/add', verifyAdminLogin, multerUploadBannerImage, bannerImageController.addBannerImagePOST);

router.post('/banner-image/remove', verifyAdminLogin, bannerImageController.removeBannerImagePOST);


/* ========================================================PRODUCT ROUTES======================================================== */

// ====================Route to Manage Products====================

router.get('/manage-products', verifyAdminLogin, productController.manageProductsGET);


// ====================Route to Add NEW Product Page====================

router.get('/add-product', verifyAdminLogin, productController.addProductGET);

router.post('/add-product', verifyAdminLogin, multerUploadProductImage, productController.addProductPOST);


// ====================Route to DELETE a PRODUCT====================

router.get('/delete-product/:id', verifyAdminLogin, productController.deleteProductGET);


// ====================Routes to EDIT a PRODUCT====================

router.get('/edit-product/:id', verifyAdminLogin, productController.editProductGET);

router.post('/edit-product/:id', verifyAdminLogin, multerUploadProductImage, productController.editProductPOST);

router.post('/delete-single-product-image', verifyAdminLogin, productController.deleteSingleProductImagePOST);


// ====================Routes for PRODUCT CATEGORIES====================

router.get('/manage-product-categories', verifyAdminLogin, productController.productCategoriesGET);

router.get('/add-new-product-category', verifyAdminLogin, productController.addProductCategoryGET);

router.post('/add-new-product-category', verifyAdminLogin, multerUploadProductCategoryImage, productController.addProductCategoryPOST);

router.get('/edit-product-category/:categoryId', verifyAdminLogin, productController.editProductCategoryGET);

router.post('/edit-product-category/:categoryId', verifyAdminLogin, multerUploadProductCategoryImage, productController.editProductCategoryPOST);

router.post('/delete-product-category/:categoryId', verifyAdminLogin, productController.deleteProductCategoryPOST);


// ================================================ OFFER MANAGEMENT ================================================

// ====================Routes for Product Offer Management ====================

router.post('/set-product-offer', verifyAdminLogin, offerController.setProductOfferPOST);

router.post('/remove-product-offer', verifyAdminLogin, offerController.removeProductOfferPOST);

// ====================Routes for Category Offer Management ====================

router.post('/set-category-offer', verifyAdminLogin, offerController.setCategoryOfferPOST);

router.post('/remove-category-offer', verifyAdminLogin, offerController.removeCategoryOfferPOST);


// ================================================ COUPON MANAGEMENT ================================================

// ====================Routes for Coupon Management ====================

router.get('/manage-coupons', verifyAdminLogin, couponController.manageCouponGET);

router.get('/add-coupon', verifyAdminLogin, couponController.addNewCouponGET);

router.post('/add-coupon', verifyAdminLogin, couponController.addNewCouponPOST);

router.get('/edit-coupon/:couponId', verifyAdminLogin, couponController.editCouponGET);

router.post('/update-coupon', verifyAdminLogin, couponController.updateCouponPOST);

router.post('/change-coupon-status', verifyAdminLogin, couponController.changeCouponStatusPOST);

router.get('/inactive-coupons', verifyAdminLogin, couponController.inactiveCouponsGET );



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
