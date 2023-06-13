/*======================================= PRODUCT CONTROLLERS =======================================*/

const path = require('path');
const productHelper = require(path.join(__dirname,'..','..','/helpers/product-helpers'));
const adminHelper = require(path.join(__dirname,'..','..','/helpers/admin-helpers'));

require('dotenv').config(); // Module to Load environment variables from .env file


let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"



// ====================Route to Add NEW Product Page====================

const addProductGET = async (req,res)=>{

    let adminData = req.session.adminSession;
  
    let productCategories = await adminHelper.getProductCategories();
  
    res.render('admin/add-product',{title: PLATFORM_NAME + " || Add Product",admin:true, adminData, PLATFORM_NAME, productCategories})
  
}
  
const addProductPOST = (req,res)=>{
  
    productHelper.addProduct(req.body,(result)=>{
  
      let adminData = req.session.adminSession;
  
      let id = result.insertedId
  
      let image = req.files.image;
  
      image.mv('./public/product-images/' + id +'.jpg',(err,done)=>{
  
        if(err){
  
          console.log(err);
  
        }else{
  
          res.render('admin/add-product',{title:"Add product",admin:true, adminData, PLATFORM_NAME});
  
        }
  
      });
  
    });
  
}


// ====================Route to DELETE a PRODUCT====================
  
const deleteProductGET = (req,res)=>{
  
    let productId = req.params.id;
  
    let productImageId = productId
  
    productHelper.deleteProduct(productId,productImageId).then((response)=>{
      // console.log(response);
    })
  
    res.redirect('/admin');
  
}
  
  
// ====================Routes to EDIT a PRODUCT====================
  
const editProductGET = async (req,res)=>{
  
    let adminData = req.session.adminSession;
  
    let productID = req.params.id;
  
    let productDetails = await productHelper.getProductDetails(productID);
  
    let productCategory = await productHelper.getProductCategoryById(productID); // Product category of this product to display
  
    let allProductCategories = await adminHelper.getProductCategories();
  
    res.render('admin/edit-product',{title:"Edit product", admin:true, adminData, PLATFORM_NAME, productDetails, productCategory, allProductCategories});
  
}
  
const editProductPOST = (req,res)=>{
  
    let productId = req.params.id;
  
    productHelper.updateProduct(productId,req.body).then(()=>{
  
      /*
      Redirect the user to admin page first, if there is any new image uploaded, update that in server after redirecting user.
      This will prevent user from keeping the user waiting in the edit page itself till the image gets uploaded.
      */
      res.redirect('/admin')
  
      // Fuction to update the image if new image is uploaded in the edit page
      if(req.files){
  
        let id = req.params.id;
  
        let image = req.files.image
  
        image.mv('./public/product-images/' + id +'.jpg',(err,done)=>{
  
          if(err){
    
            console.log(err);
    
          }
    
        });
  
      }
  
    })
  
}
  
  
// ====================Controllers for PRODUCT CATEGORIES====================
  
const productCategoriesGET = async (req,res)=>{
  
    let adminData = req.session.adminSession;
  
    let productCategories = await adminHelper.getProductCategories();
  
    res.render('admin/view-product-categories', {title: PLATFORM_NAME + " || Product Categories", admin:true, adminData, productCategories});
  
}
  
const addProductCategoryGET = (req,res)=>{
  
    let adminData = req.session.adminSession;
  
    if(req.session.adminSession.categoryExistsErr){
  
      let categoryExistsErr = req.session.adminSession.categoryExistsErr;
  
      res.render('admin/add-product-category', {title: PLATFORM_NAME + " || Add Product Category", admin:true, adminData, categoryExistsErr});
  
      delete req.session.adminSession.categoryExistsErr;
  
    }else{
      
      res.render('admin/add-product-category', {title: PLATFORM_NAME + " || Add Product Category", admin:true, adminData});
  
    }
  
}
  
const addProductCategoryPOST = async (req,res)=>{
  
    let adminData = req.session.adminSession;
  
    let categoryDetails = req.body;
  
    await adminHelper.checkProductCategoryExists(categoryDetails.name).then((response)=>{
  
      if(response.status){ // The Product category Already Exist - Denying the addition of category to prevent Duplication
        
        req.session.adminSession.categoryExistsErr = response.message; // Storing the error message in Admin session for displaying to Admin
  
        res.redirect('/admin/add-new-product-category')
  
      }else{ // Product category Dosen't exist - Adding the Product Category
  
        categoryDetails.creatorDetails = {
  
          name:adminData.name,
      
          id: adminData._id
      
        }
      
        categoryDetails.createdOn = new Date();
      
        adminHelper.addProductCategory(categoryDetails).then((categoryId)=>{
      
          let id = categoryId;
      
          if(req.files){
      
            let image = req.files['category-image'];
      
            image.mv('./public/product-category-images/' + id +'.jpg',(err,done)=>{
      
              if(err){
      
                console.log(err);
      
              }else{
      
                res.redirect('/admin/add-new-product-category');
      
              }
      
            });
      
          }
      
        })
  
      }
  
    })
  
}
  
const editProductCategoryGET = async (req,res)=>{
  
    let adminData = req.session.adminSession;
  
    let categoryId = req.params.categoryId;
  
    adminHelper.getProductCategoryDetails(categoryId).then((productCategoryData)=>{
  
      res.render('admin/edit-product-category', {title: PLATFORM_NAME + " || Edit Product Category", admin:true, adminData, productCategoryData});
  
    })
  
}
  
const editProductCategoryPOST = async (req,res)=>{
  
    let categoryId = req.params.categoryId;
  
    let updatedData = {
  
      categoryId : req.body.categoryId,
  
      name : req.body.name,
  
      description : req.body.description,
  
      updatedOn: new Date()
  
    }
  
    adminHelper.updateProductCategory(categoryId, updatedData).then(()=>{
  
      res.redirect('/admin/manage-product-categories');
  
    })
  
}
  
const deleteProductCategoryPOST = async (req,res)=>{
  
    let categoryId = req.params.categoryId;
  
    adminHelper.deleteProductCategory(categoryId).then(()=>{
  
      res.redirect('/admin/manage-product-categories');
  
    })
  
}









module.exports = {

    addProductGET,
    addProductPOST,
    deleteProductGET,
    editProductGET,
    editProductPOST,
    productCategoriesGET,
    addProductCategoryGET,
    addProductCategoryPOST,
    editProductCategoryGET,
    editProductCategoryPOST,
    deleteProductCategoryPOST

}