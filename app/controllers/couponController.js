/*======================================= COUPON CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"



/* ============================================= ADD, EDIT & DEACTIVATE COUPONS CONTROLLERS ============================================= */









/* ============================================= MANAGE COUPONS CONTROLLERS ============================================= */

const manageCouponGET =  (req, res)=>{
  
    let adminData = req.session.adminSession;
  
    res.render('admin/coupon-manage',{ layout: 'admin-layout', title: PLATFORM_NAME + " || Admin Panel", PLATFORM_NAME, adminData, PLATFORM_NAME });
    
};



















module.exports = {

    manageCouponGET
    
}