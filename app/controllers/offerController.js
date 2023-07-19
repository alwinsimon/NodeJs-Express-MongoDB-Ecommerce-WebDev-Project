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













/* ======================== Exporting Controllers ======================== */
module.exports = {

    setProductOfferPOST,
    removeProductOfferPOST,
    setCategoryOfferPOST,
    removeCategoryOfferPOST

}