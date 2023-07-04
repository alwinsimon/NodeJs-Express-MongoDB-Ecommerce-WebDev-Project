/*======================================= COUPON CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const couponHelpers = require('../../helpers/coupon-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"



/* ============================================= ADD, EDIT & DEACTIVATE COUPONS CONTROLLERS ============================================= */









/* ============================================= MANAGE COUPONS CONTROLLERS ============================================= */

const manageCouponGET =  (req, res)=>{
  
    const adminData = req.session.adminSession;
  
    res.render('admin/coupon-manage',{ layout: 'admin-layout', title: PLATFORM_NAME + " || Admin Panel", PLATFORM_NAME, adminData, PLATFORM_NAME });
    
};


/* ============================================= ADD COUPON CONTROLLERS ============================================= */

const addNewCouponGET =  (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        let couponExistError = false;

        if(req.session.couponExistError){

            couponExistError = req.session.couponExistError;
            
        }
  
        res.render('admin/coupon-add',{ layout: 'admin-layout', title: PLATFORM_NAME + " || Admin Panel", PLATFORM_NAME, adminData, PLATFORM_NAME, couponExistError });

        delete req.session.couponExistError;

    }catch (error){

        console.log("Error from addNewCouponGET couponController :", error);

        res.redirect('/admin/error-page');

    }
    
};

const addNewCouponPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const newCouponData = req.body;
    
        const couponExist = await couponHelpers.verifyCouponExist(newCouponData);
    
        if(couponExist.status){
    
            const couponAddingStatus = await couponHelpers.addNewCoupon(newCouponData,adminData);
    
            if(couponAddingStatus.insertedId){
    
                res.redirect('/admin/add-coupon');
    
            }else{
    
                console.log("Error from addNewCouponPOST Controller,  Error in inserting new coupon to DB : ", couponAddingStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }else if (couponExist.duplicateCoupon){
    
            req.session.couponExistError = "Coupon code already exist, try some other code"

            res.redirect('/admin/add-coupon');
    
        }

    }catch (error){

        console.log("Error from addNewCouponPOST couponController :", error);

        res.redirect('/admin/error-page');

    }
    
};
















module.exports = {

    manageCouponGET,
    addNewCouponGET,
    addNewCouponPOST

}