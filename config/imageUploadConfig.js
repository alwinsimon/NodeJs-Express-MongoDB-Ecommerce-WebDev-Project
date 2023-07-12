/*========================================================================================================================
                ==================== MULTER IMAGE UPLOAD Configuration to export ====================
========================================================================================================================== */


const multer = require('multer');


const productImageStorage = multer.diskStorage({

    destination: (req, file, cb) => { cb( null, path.join(__dirname, '../public/product-images') ) },

    filename: (req, file, cb) => { const name = Date.now() + '-' + file.originalname; cb(null, name) }

})
  
const productImageUpload = multer({ storage: productImageStorage })










module.exports = {

    productImageStorage,
    productImageUpload

}