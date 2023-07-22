/*======================================= BANNER IMAGE CONTROLLERS =======================================*/

const adminHelpers = require('../../helpers/admin-helpers');
const bannerImageHelpers = require('../../helpers/bannerImage-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"


const viewBannerImagesGET = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const bannerImages = await bannerImageHelpers.getAllBannerImages();

        const dataToRender = { 
            
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Banner Images",
            PLATFORM_NAME,
            adminData,
            bannerImages
        
        }

        res.render('admin/view-banner-image', dataToRender);

    }catch(error){

        console.log("Error from viewBannerImagesGET adminBannerImageController: ", error);

        res.redirect('/admin/error-page');

    }

}


const addBannerImageGET = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const dataToRender = { 
            
            layout: 'admin-layout',
            title: PLATFORM_NAME + " || Add Banner Image",
            PLATFORM_NAME,
            adminData
        
        }

        res.render('admin/add-banner-image', dataToRender);

    }catch(error){

        console.log("Error from addBannerImageGET adminBannerImageController: ", error);

        res.redirect('/admin/error-page');

    }

}


const addBannerImagePOST = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        let bannerImageDetails = req.body;

        bannerImageDetails.bannerImage = req.file.filename;

        const insertBannerImage = await bannerImageHelpers.addNewBannerImage(bannerImageDetails);

        res.redirect('/admin/banner-image/add');
        

    }catch(error){

        console.log("Error from addBannerImagePOST adminBannerImageController: ", error);

        res.redirect('/admin/error-page');

    }

}


const removeBannerImagePOST = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const bannerImageId = req.body.bannerImageId;

        const deleteBannerImage = await bannerImageHelpers.removeBannerImage(bannerImageId);

        res.redirect('/admin/banner-image/view');
        

    }catch(error){

        console.log("Error from addBannerImagePOST adminBannerImageController: ", error);

        res.redirect('/admin/error-page');

    }

}










module.exports = {

    viewBannerImagesGET,
    addBannerImageGET,
    addBannerImagePOST,
    removeBannerImagePOST

}