/*======================================= OFFER CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const userHelpers = require('../../helpers/user-helpers');
const offerHelpers = require('../../helpers/offer-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"

/*========================================================================================================================
                       ==================== ADMIN SIDE OFFER CONTROLLERS ====================
==========================================================================================================================*/


/* ======================== ADD, EDIT & DEACTIVATE OFFER CONTROLLERS ======================== */


/* ======================== MANAGE OFFER ======================== */

const manageOfferGET =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const activeOfferData = await offerHelpers.getActiveOffers();
    
        const dataToRender = {
    
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Manage Offers",
            PLATFORM_NAME,
            adminData,
            activeOfferData
    
        }
      
        res.render('admin/offer-manage', dataToRender );
    
    }catch(error){
    
        console.log("Error from manageOfferGET offerController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};

const inactiveOffersGET =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const inActiveOffers = await offerHelpers.getInActiveOffers();
    
        const dataToRender = {
    
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Inactive coupons",
            PLATFORM_NAME,
            adminData,
            inActiveCoupons
    
        }
      
        res.render('admin/offer-deactivated', dataToRender );
    
    }catch(error){
    
        console.log("Error from inactiveCouponsGET couponController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};


/* ======================== ADD COUPON ======================== */

const addNewOfferGET =  (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        let offerExistError = false;

        if(req.session.offerExistError){

            offerExistError = req.session.offerExistError;
            
        }

        const dataToRender = {

            layout: 'admin-layout',
            PLATFORM_NAME,
            title: PLATFORM_NAME + " || Add Offer",
            adminData,
            offerExistError

        }
  
        res.render('admin/offer-add', dataToRender);

        delete req.session.offerExistError;

    }catch (error){

        console.log("Error from addNewOfferGET offer :", error);

        res.redirect('/admin/error-page');

    }
    
};

const addNewOfferPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const newOfferData = req.body;
    
        const offerExist = await offerHelpers.verifyOfferExist(newOfferData);
    
        if(offerExist.status){
    
            const offerAddingStatus = await offerHelpers.addNewOffer(newOfferData,adminData);
    
            if(offerAddingStatus.insertedId){
    
                res.redirect('/admin/add-offer');
    
            }else{
    
                console.log("Error from addNewOfferPOST Controller,  Error in inserting new Offer to DB : ", offerAddingStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }else if (offerExist.duplicateOffer){
    
            req.session.offerExistError = "Offer name already exist, try some other name"

            res.redirect('/admin/add-offer');
    
        }

    }catch (error){

        console.log("Error from addNewOfferPOST offerController :", error);

        res.redirect('/admin/error-page');

    }
    
};


/* ======================== EDIT COUPON ======================== */

const editOfferGET =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        let offerExistError = false;

        if(req.session.offerExistError){

            offerExistError = req.session.offerExistError;
            
        }

        const offerId = req.params.offerId;

        const offerData = await offerHelpers.getSingleOfferData(offerId);

        const dataToRender = {
            
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Edit offer",
            PLATFORM_NAME,
            adminData,
            couponExistError,
            couponData

        }
  
        res.render('admin/offer-edit', dataToRender);

        delete req.session.offerExistError;

    }catch (error){

        console.log("Error from editOfferGET offerController :", error);

        res.redirect('/admin/error-page');

    }
    
};

const updateOfferPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const offerDataForUpdate = req.body;

        const offerId = offerDataForUpdate.offerId;
    
        const offerExist = await offerHelpers.verifyOfferExist(offerDataForUpdate);
    
        if(offerExist.status){
    
            const offerUpdateStatus = await offerHelpers.updateOfferData(offerDataForUpdate, adminData);
    
            if(offerUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/manage-offers');
    
            }else{
    
                console.log("Error-1 from updateOfferPOST Controller: ", couponUpdateStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }else if (offerUpdateStatus.duplicateOffer){
    
            req.session.offerExistError = "Offer name already exist, try some other name."

            res.redirect('/admin/edit-offer/' + offerId );
    
        }

    }catch (error){

        console.log("Error-2 from updateOfferPOST offerController :", error);

        res.redirect('/admin/error-page');

    }
    
};


/* ======================== ACTIVATE/DEACTIVATE COUPON ======================== */

const changeOfferStatusPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const offerId = req.body.offerId;
    
        const offerData = await offerHelpers.getSingleOfferData(offerId);
    
        if(offerData.activeOffer){
    
            const offerUpdateStatus = await offerHelpers.changeOfferStatus(offerData, "Deactivate", adminData);
    
            if(offerUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/manage-coupons');
    
            }else{
    
                console.log("Error-1 from changeOfferStatusPOST offerController: ", offerUpdateStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }else if (!offerData.activeOffer){
    
            const offerUpdateStatus = await offerHelpers.changeOfferStatus(offerData, "Activate", adminData);
    
            if(offerUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/inactive-coupons');
    
            }else{
    
                console.log("Error-2 from changeOfferStatusPOST offerController: ", couponUpdateStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }

    }catch (error){

        console.log("Error-3 from changeOfferStatusPOST offerController :", error);

        res.redirect('/admin/error-page');

    }
    
};






























/* ======================== Exporting Controllers ======================== */
module.exports = {

    manageOfferGET,
    inactiveOffersGET,
    addNewOfferGET,
    addNewOfferPOST,
    editOfferGET,
    updateOfferPOST,
    changeOfferStatusPOST,

}