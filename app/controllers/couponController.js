/*======================================= COUPON CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const userHelpers = require('../../helpers/user-helpers');
const couponHelpers = require('../../helpers/coupon-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"

/*========================================================================================================================
                       ==================== ADMIN SIDE COUPON CONTROLLERS ====================
==========================================================================================================================*/


/* ======================== ADD, EDIT & DEACTIVATE COUPONS CONTROLLERS ======================== */


/* ======================== MANAGE COUPONS CONTROLLERS ======================== */

const manageCouponGET =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const activeCoupons = await couponHelpers.getActiveCoupons();
    
        const inActiveCoupons = await couponHelpers.getInActiveCoupons();
    
        const dataToRender = {
    
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Manage Coupons",
            PLATFORM_NAME,
            adminData,
            activeCoupons,
            inActiveCoupons
    
        }
      
        res.render('admin/coupon-manage', dataToRender );
    
    }catch(error){
    
        console.log("Error from manageCouponGET couponController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};

const inactiveCouponsGET =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const inActiveCoupons = await couponHelpers.getInActiveCoupons();
    
        const dataToRender = {
    
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Inactive coupons",
            PLATFORM_NAME,
            adminData,
            inActiveCoupons
    
        }
      
        res.render('admin/coupon-deactivated', dataToRender );
    
    }catch(error){
    
        console.log("Error from inactiveCouponsGET couponController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};


/* ======================== ADD COUPON CONTROLLERS ======================== */

const addNewCouponGET =  (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        let couponExistError = false;

        if(req.session.couponExistError){

            couponExistError = req.session.couponExistError;
            
        }
  
        res.render('admin/coupon-add',{ layout: 'admin-layout', title: PLATFORM_NAME + " || Add coupon", PLATFORM_NAME, adminData, PLATFORM_NAME, couponExistError });

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


/* ======================== EDIT COUPON CONTROLLERS ======================== */

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
            title: PLATFORM_NAME + " || Edit coupon",
            PLATFORM_NAME,
            adminData,
            couponExistError,
            couponData

        }
  
        res.render('admin/coupon-edit', dataToRender);

        delete req.session.couponExistError;

    }catch (error){

        console.log("Error from editCouponGET couponController :", error);

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


/* ======================== ACTIVATE/DEACTIVATE COUPON CONTROLLERS ======================== */

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



/*========================================================================================================================
                        ==================== USER SIDE COUPON CONTROLLERS ====================
==========================================================================================================================*/


/* ======================== APPLY COUPON CONTROLLER ======================== */

const applyCouponPOST =  async (req, res)=>{

    try{

        const userData = req.session.userSession;

        const couponCode = req.body.couponCodeFromUser.toLowerCase();

        const couponData = await couponHelpers.getCouponDataByCouponCode(couponCode);
    
        const couponEligible = await couponHelpers.verifyCouponEligibility(couponCode);
    
        if(couponEligible.status){

            const cartValue = await userHelpers.getCartValue(userData._id);

            if(cartValue >= couponData.minOrderValue){

                const userEligible = await couponHelpers.verifyCouponUsedStatus(userData._id, couponData._id);

                if(userEligible.status){

                    const applyNewCoupon = await couponHelpers.applyCouponToCart(userData._id, couponData._id);

                    if(applyNewCoupon.status){

                        req.session.couponApplied = "Congrats, Coupon applied succesfully";

                        res.redirect('/place-order');

                    }else{

                        req.session.couponInvalidError = "Sorry, Unexpected Error in applying coupon";

                        res.redirect('/place-order');

                    }

                }else{

                    req.session.couponInvalidError = "Coupon already used earlier";

                    res.redirect('/place-order');

                }

            }else{

                req.session.couponInvalidError = "Coupon not applied, purchase minimum for ₹" + couponData.minOrderValue + " to get coupon";

                res.redirect('/place-order');

            }
    
        }else if (couponEligible.reasonForRejection){

            req.session.couponInvalidError = couponEligible.reasonForRejection;

            res.redirect('/place-order');
    
        }

    }catch (error){

        console.log("Error from applyCouponPOST couponController :", error);

        res.redirect('/error-page');

    }
    
};






























/* ======================== Exporting Controllers ======================== */
module.exports = {

    /*=== Admin Coupon Controllers ===*/
    manageCouponGET,
    inactiveCouponsGET,
    addNewCouponGET,
    addNewCouponPOST,
    editCouponGET,
    updateCouponPOST,
    changeCouponStatusPOST,


    /*=== User Coupon Controllers ===*/
    applyCouponPOST

}