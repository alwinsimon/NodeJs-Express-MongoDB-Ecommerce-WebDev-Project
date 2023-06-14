const express = require('express');
const router = express.Router();
const adminMiddlewares = require('../middlewares/adminMiddlewares');
const adminController = require('../app/controllers/adminController');
const productController = require('../app/controllers/productController');


/*=======================================MIDDLEWARES=======================================*/

// Middleware to verify if the requests are made by admin
const verifyAdminLogin = adminMiddlewares.verifyAdminLogin;


/*=================================================ADMIN ROUTES=================================================*/


/* ========================LOGIN & LOGOUT ROUTES======================== */

router.get('/login', adminController.logInGET);

router.post('/login', adminController.logInPOST);

router.post('/logout', adminController.logOutPOST);


/* ====================Routes to Add New Admin==================== */

router.get('/add-admin', verifyAdminLogin, adminController.addNewAdminGET);

router.post('/add-admin', verifyAdminLogin, adminController.addNewAdminPOST);


// ====================Route to Admin Dashboard====================
router.get('/', verifyAdminLogin, adminController.adminDashboardGET);


// ====================Routes to Manage Users====================

router.get('/manage-users', verifyAdminLogin, adminController.manageUsersGET);

router.post('/change-user-status', verifyAdminLogin, adminController.changeUserStatusPOST);


/* ========================================================PRODUCT ROUTES======================================================== */

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


// ====================Routes for Managing Orders====================

router.get('/order-summary', verifyAdminLogin, adminController.manageOrdersGET);






module.exports = router;
