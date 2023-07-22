
const path = require('path');
const multer = require('multer');

/*========================================================================================================================
                ==================== MULTER IMAGE UPLOAD Configuration to export ====================
========================================================================================================================== */


// ================================================ Product Image Upload Configuration ================================================

const productImageStorage = multer.diskStorage({

    destination: (req, file, cb) => { cb( null, path.join(__dirname, '../public/product-images') ) },

    filename: (req, file, cb) => { const name = "ProdImg-" + Date.now() + '-' + file.originalname; cb(null, name) }

})
  
const uploadProductImage = multer({ storage: productImageStorage });


// ================================================ Product-Category Image Upload Configuration ================================================

const productCategoryImageStorage = multer.diskStorage({

    destination: (req, file, cb) => { cb( null, path.join(__dirname, '../public/product-category-images') ) },

    filename: (req, file, cb) => { const name = "CatGyImg-" + Date.now() + '-' + file.originalname; cb(null, name) }

})
  
const uploadProductCategoryImage = multer({ storage: productCategoryImageStorage })


// ================================================ Product-Category Image Upload Configuration ================================================

const bannerImageStorage = multer.diskStorage({

    destination: (req, file, cb) => { cb( null, path.join(__dirname, '../public/banner-images') ) },

    filename: (req, file, cb) => { const name = "BannerImg-" + Date.now() + '-' + file.originalname; cb(null, name) }

})

const uploadBannerImage = multer({ storage: bannerImageStorage })










module.exports = {

    uploadProductImage,
    uploadProductCategoryImage,
    uploadBannerImage

}