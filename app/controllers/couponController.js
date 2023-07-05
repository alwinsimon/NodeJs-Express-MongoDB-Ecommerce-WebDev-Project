/*======================================= COUPON CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const couponHelpers = require('../../helpers/coupon-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"



/* ============================================= ADD, EDIT & DEACTIVATE COUPONS CONTROLLERS ============================================= */









/* ============================================= MANAGE COUPONS CONTROLLERS ============================================= */

const manageCouponGET =  async (req, res)=>{
  
    const adminData = req.session.adminSession;

    const activeCoupons = await couponHelpers.getActiveCoupons();

    const inActiveCoupons = await couponHelpers.getInActiveCoupons();

    const dataToRender = {

        layout: 'admin-layout',
        title: PLATFORM_NAME + " || Admin Panel",
        PLATFORM_NAME,
        adminData,
        activeCoupons,
        inActiveCoupons

    }
  
    res.render('admin/coupon-manage', dataToRender );
    
};

const inactiveCouponsGET =  async (req, res)=>{
  
    const adminData = req.session.adminSession;

    const inActiveCoupons = await couponHelpers.getInActiveCoupons();

    const dataToRender = {

        layout: 'admin-layout',
        title: PLATFORM_NAME + " || Admin Panel",
        PLATFORM_NAME,
        adminData,
        inActiveCoupons

    }
  
    res.render('admin/coupon-deactivated', dataToRender );
    
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


/* ============================================= EDIT COUPON CONTROLLERS ============================================= */

const editCouponGET =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        let couponExistError = false;

        if(req.session.couponExistError){

            couponExistError = req.session.couponExistError;
            
        }

        const couponId = req.params.couponId;

        const couponData = await couponHelpers.getSingleCouponData(couponId);

        const dataToRender = {
            
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Admin Panel",
            PLATFORM_NAME,
            adminData,
            couponExistError,
            couponData

        }
  
        res.render('admin/coupon-edit', dataToRender);

        delete req.session.couponExistError;

    }catch (error){

        console.log("Error from editCouponPOST couponController :", error);

        res.redirect('/admin/error-page');

    }
    
};

const updateCouponPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const couponDataForUpdate = req.body;

        const couponId = couponDataForUpdate.couponId;
    
        const couponExist = await couponHelpers.verifyCouponExist(couponDataForUpdate);
    
        if(couponExist.status){
    
            const couponUpdateStatus = await couponHelpers.updateCouponData(couponDataForUpdate, adminData);
    
            if(couponUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/manage-coupons');
    
            }else{
    
                console.log("Error-1 from updateCouponPOST Controller: ", couponUpdateStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }else if (couponExist.duplicateCoupon){
    
            req.session.couponExistError = "Coupon code already exist, try some other code"

            res.redirect('/admin/edit-coupon/' + couponId );
    
        }

    }catch (error){

        console.log("Error-2 from updateCouponPOST couponController :", error);

        res.redirect('/admin/error-page');

    }
    
};


/* ============================================= ACTIVATE/DEACTIVATE COUPON CONTROLLERS ============================================= */

const changeCouponStatusPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const couponId = req.body.couponId;
    
        const couponData = await couponHelpers.getSingleCouponData(couponId);
    
        if(couponData.activeCoupon){
    
            const couponUpdateStatus = await couponHelpers.changeCouponStatus(couponData, "Deactivate", adminData);
    
            if(couponUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/manage-coupons');
    
            }else{
    
                console.log("Error-1 from changeCouponStatusPOST Controller: ", couponUpdateStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }else if (!couponData.activeCoupon){
    
            const couponUpdateStatus = await couponHelpers.changeCouponStatus(couponData, "Activate", adminData);
    
            if(couponUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/inactive-coupons');
    
            }else{
    
                console.log("Error-2 from changeCouponStatusPOST Controller: ", couponUpdateStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }

    }catch (error){

        console.log("Error-3 from changeCouponStatusPOST couponController :", error);

        res.redirect('/admin/error-page');

    }
    
};













module.exports = {

    manageCouponGET,
    inactiveCouponsGET,
    addNewCouponGET,
    addNewCouponPOST,
    editCouponGET,
    updateCouponPOST,
    changeCouponStatusPOST

}