const express = require('express');
const router = express.Router();
const vendorController = require('../app/controllers/vendorController');
const productController = require('../app/controllers/productController');
const vendorMiddlewares = require('../middlewares/vendorMiddlewares');



/*=======================================MIDDLEWARES=======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyVendorLogin = vendorMiddlewares.verifyVendorLogin;


/* ========================VENDOR SIGN-UP ROUTES======================== */

router.get('/signup', vendorController.vendorSignUpGET);
  
router.post('/signup',vendorController.vendorSignUpPOST);


/* ========================LOGIN & LOGOUT ROUTES======================== */

router.get('/login', vendorController.vendorLogInGET);

router.post('/login', vendorController.vendorLogInPOST);

router.post('/logout', vendorController.vendorLogOutPOST)


// ====================Route to Vendor Dashboard====================

router.get('/', verifyVendorLogin, vendorController.vendorDashboardGET);







module.exports = router;
