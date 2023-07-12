
const path = require('path');
const multer = require('multer');

/*========================================================================================================================
                ==================== MULTER IMAGE UPLOAD Configuration to export ====================
========================================================================================================================== */


// ================================================ Product Image Upload Configuration ================================================

const productImageStorage = multer.diskStorage({

    destination: (req, file, cb) => { cb( null, path.join(__dirname, '../public/product-images') ) },

    filename: (req, file, cb) => { const name = Date.now() + '-' + file.originalname; cb(null, name) }

})
  
const uploadProductImage = multer({ storage: productImageStorage })










module.exports = {

    uploadProductImage

}