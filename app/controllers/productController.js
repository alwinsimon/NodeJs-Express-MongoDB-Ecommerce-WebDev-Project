/*======================================= PRODUCT CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"



// ====================Controller for Managing Products====================

const manageProductsGET =  (req, res)=>{

  try{

    const adminData = req.session.adminSession;

    productHelpers.getAllProducts().then((products)=>{
      
      res.render('admin/view-products',{ layout: 'admin-layout', title: PLATFORM_NAME + " || Admin Panel", PLATFORM_NAME, admin:true, adminData, PLATFORM_NAME, products});
      
    })

  }catch(error){

    console.log("Error from manageProductsGET productController: ", error);

    res.redirect('/admin/error-page');

  }

};


// ====================Route to Add NEW Product Page====================

const addProductGET = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const productCategories = await adminHelpers.getProductCategories();
  
    res.render('admin/add-product',{ layout: 'admin-layout', title: PLATFORM_NAME + " || Add Product",admin:true, adminData, PLATFORM_NAME, productCategories});

  }catch(error){

    console.log("Error from addProductGET productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const addProductPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const productData = req.body;

    productData.productOffer = 0;

    let productImageArray = [];

    for (let i = 0; i < req.files.length; i++) {

      productImageArray[i] = req.files[i].filename;

    }

    productData.images = productImageArray;

    const addNewProduct = await productHelpers.addProduct(productData);

    res.render('admin/add-product',{ layout: 'admin-layout', title:"Add product", adminData, PLATFORM_NAME});

  }catch(error){

    console.log("Error from addProductPOST productController: ", error);

    res.redirect('/admin/error-page');

  }

}


// ====================Route to DELETE a PRODUCT====================
  
const deleteProductGET = (req,res)=>{

  try{

    const productId = req.params.id;

    const productImageId = productId
  
    productHelpers.deleteProduct(productId,productImageId).then((response)=>{
      // console.log(response);
    })
  
    res.redirect('/admin');

  }catch(error){

    console.log("Error from deleteProductGET productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
  
// ====================Routes to EDIT a PRODUCT====================
  
const editProductGET = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const productID = req.params.id;
  
    const productDetails = await productHelpers.getProductDetails(productID);
  
    const productCategory = await productHelpers.getProductCategoryById(productID); // Product category of this product to display
  
    const allProductCategories = await adminHelpers.getProductCategories();
  
    res.render('admin/edit-product',{ layout: 'admin-layout', title:"Edit product", admin:true, adminData, PLATFORM_NAME, productDetails, productCategory, allProductCategories});

  }catch(error){

    console.log("Error from editProductGET productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const editProductPOST = (req,res)=>{

  try{

    const productId = req.params.id;

    productHelpers.updateProduct(productId,req.body).then(()=>{
  
      /*
      Redirect the user to admin page first, if there is any new image uploaded, update that in server after redirecting user.
      This will prevent user from keeping the user waiting in the edit page itself till the image gets uploaded.
      */
      res.redirect('/admin')
  
      // Fuction to update the image if new image is uploaded in the edit page
      if(req.files){
  
        const id = req.params.id;
  
        let image = req.files.image
  
        image.mv('./public/product-images/' + id +'.jpg',(err,done)=>{
  
          if(err){
    
            console.log(err);
    
          }
    
        });
  
      }
  
    })

  }catch(error){

    console.log("Error from editProductPOST productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
  
// ====================Controllers for PRODUCT CATEGORIES====================
  
const productCategoriesGET = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const productCategories = await adminHelpers.getProductCategories();
  
    res.render('admin/view-product-categories', { layout: 'admin-layout', title: PLATFORM_NAME + " || Product Categories", admin:true, adminData, productCategories});

  }catch(error){

    console.log("Error from productCategoriesGET productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const addProductCategoryGET = (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    if(req.session.adminSession.categoryExistsErr){
  
      const categoryExistsErr = req.session.adminSession.categoryExistsErr;
  
      res.render('admin/add-product-category', { layout: 'admin-layout', title: PLATFORM_NAME + " || Add Product Category", admin:true, adminData, categoryExistsErr});
  
      delete req.session.adminSession.categoryExistsErr;
  
    }else{
      
      res.render('admin/add-product-category', { layout: 'admin-layout', title: PLATFORM_NAME + " || Add Product Category", admin:true, adminData});
  
    }

  }catch(error){

    console.log("Error from addProductCategoryGET productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const addProductCategoryPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    let categoryDetails = req.body;
  
    await adminHelpers.checkProductCategoryExists(categoryDetails.name).then((response)=>{
  
      if(response.status){ // The Product category Already Exist - Denying the addition of category to prevent Duplication
        
        req.session.adminSession.categoryExistsErr = response.message; // Storing the error message in Admin session for displaying to Admin
  
        res.redirect('/admin/add-new-product-category')
  
      }else{ // Product category Dosen't exist - Adding the Product Category
  
        categoryDetails.creatorDetails = {
  
          name:adminData.name,
      
          id: adminData._id
      
        }
      
        categoryDetails.createdOn = new Date();
      
        adminHelpers.addProductCategory(categoryDetails).then((categoryId)=>{
      
          const id = categoryId;
      
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

  }catch(error){

    console.log("Error from addProductCategoryPOST productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const editProductCategoryGET = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const categoryId = req.params.categoryId;
  
    adminHelpers.getProductCategoryDetails(categoryId).then((productCategoryData)=>{
  
      res.render('admin/edit-product-category', { layout: 'admin-layout', title: PLATFORM_NAME + " || Edit Product Category", admin:true, adminData, productCategoryData});
  
    })

  }catch(error){

    console.log("Error from editProductCategoryGET productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const editProductCategoryPOST = async (req,res)=>{

  try{

    const categoryId = req.params.categoryId;

    const updatedData = {
  
      categoryId : req.body.categoryId,
  
      name : req.body.name,
  
      description : req.body.description,
  
      updatedOn: new Date()
  
    }
  
    adminHelpers.updateProductCategory(categoryId, updatedData).then(()=>{
  
      res.redirect('/admin/manage-product-categories');
  
    })

  }catch(error){

    console.log("Error from editProductCategoryPOST productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const deleteProductCategoryPOST = async (req,res)=>{

  try{

    const categoryId = req.params.categoryId;

    adminHelpers.deleteProductCategory(categoryId).then(()=>{
  
      res.redirect('/admin/manage-product-categories');
  
    })

  }catch(error){

    console.log("Error from deleteProductCategoryPOST productController: ", error);

    res.redirect('/admin/error-page');

  }

}









module.exports = {

  manageProductsGET,
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