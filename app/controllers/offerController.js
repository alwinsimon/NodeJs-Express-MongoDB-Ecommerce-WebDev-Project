/*======================================= OFFER CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const userHelpers = require('../../helpers/user-helpers');
const offerHelpers = require('../../helpers/offer-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"




/*========================================================================================================================
                       ==================== ADMIN SIDE PRODUCT OFFER CONTROLLERS ====================
==========================================================================================================================*/

const setProductOfferPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const productId = req.body.productId;

        const productOfferPercentage = parseInt(req.body.productOfferPercentage);

        const updateProductOffer = offerHelpers.setProductOffer( productId, productOfferPercentage );

        res.redirect("/admin/manage-products")
    
    }catch(error){
    
        console.log("Error from setProductOfferPOST offerController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};


const removeProductOfferPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const productId = req.body.productId;

        const productOfferPercentage = 0;

        const updateProductOffer = offerHelpers.setProductOffer( productId, productOfferPercentage );

        res.redirect("/admin/manage-products")
    
    }catch(error){
    
        console.log("Error from removeProductOfferPOST offerController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};



/*========================================================================================================================
                       ==================== ADMIN SIDE CATEGORY OFFER CONTROLLERS ====================
==========================================================================================================================*/

const setCategoryOfferPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const categoryId = req.body.categoryId;

        const categoryOfferPercentage = parseInt(req.body.categoryOfferPercentage);

        const updateProductOffer = offerHelpers.setCategoryOffer( categoryId, categoryOfferPercentage );

        res.redirect("/admin/manage-product-categories")
    
    }catch(error){
    
        console.log("Error from setCategoryOfferPOST offerController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};


const removeCategoryOfferPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const categoryId = req.body.productId;

        const categoryOfferPercentage = 0;

        const updateCategoryOffer = offerHelpers.setCategoryOffer( categoryId, categoryOfferPercentage );

        res.redirect("/admin/manage-product-categories")
    
    }catch(error){
    
        console.log("Error from removeCategoryOfferPOST offerController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};










/*========================================================================================================================
                       ==================== ADMIN SIDE CATEGORY OFFER CONTROLLERS ====================
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

        const inActiveOfferData = await offerHelpers.getInActiveOffers();
    
        const dataToRender = {
    
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Inactive offers",
            PLATFORM_NAME,
            adminData,
            inActiveOfferData
    
        }
      
        res.render('admin/offer-deactivated', dataToRender );
    
    }catch(error){
    
        console.log("Error from inactiveOffersGET offerController: ", error);
    
        res.redirect('/admin/error-page');
    
    }

};


/* ======================== ADD OFFER ======================== */

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


/* ======================== EDIT OFFER ======================== */

const editOfferGET =  async (req, res)=>{

    try{

        const offerName = req.params.offerName;
        
        const adminData = req.session.adminSession;

        const offerExistError = req.session.offerExistError;

        const offerData = await offerHelpers.getSingleOfferDataWithOfferName(offerName);

        const dataToRender = {
            
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Edit offer",
            PLATFORM_NAME,
            adminData,
            offerExistError,
            offerData

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

        const offerName = offerDataForUpdate.offerName;
    
        const offerExist = await offerHelpers.verifyOfferExist(offerDataForUpdate);
    
        if(offerExist.status){
    
            const offerUpdateStatus = await offerHelpers.updateOfferData(offerDataForUpdate, adminData);
    
            if(offerUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/manage-offers');
    
            }else{
    
                console.log("Error-1 from updateOfferPOST Controller: ", offerUpdateStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }else if (offerExist.duplicateOffer){
    
            req.session.offerExistError = "Offer name already exist, try some other name."

            res.redirect('/admin/edit-offer/' + offerName );
    
        }

    }catch (error){

        console.log("Error-2 from updateOfferPOST offerController :", error);

        res.redirect('/admin/error-page');

    }
    
};


/* ======================== ACTIVATE/DEACTIVATE OFFER ======================== */

const changeOfferStatusPOST =  async (req, res)=>{

    try{

        const adminData = req.session.adminSession;

        const offerId = req.body.offerId;
    
        const offerData = await offerHelpers.getSingleOfferData(offerId);
    
        if(offerData.activeOffer){
    
            const offerUpdateStatus = await offerHelpers.changeOfferStatus(offerData, "Deactivate", adminData);
    
            if(offerUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/manage-offers');
    
            }else{
    
                console.log("Error-1 from changeOfferStatusPOST offerController: ", offerUpdateStatus);
    
                res.redirect('/admin/error-page');
            }
    
        }else if (!offerData.activeOffer){
    
            const offerUpdateStatus = await offerHelpers.changeOfferStatus(offerData, "Activate", adminData);
    
            if(offerUpdateStatus.modifiedCount === 1){
    
                res.redirect('/admin/inactive-offers');
    
            }else{
    
                console.log("Error-2 from changeOfferStatusPOST offerController: ", offerUpdateStatus);
    
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
    setProductOfferPOST,
    removeProductOfferPOST,
    setCategoryOfferPOST,
    removeCategoryOfferPOST

}