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
  
    res.render('admin/add-product',{ layout: 'admin-layout', title: PLATFORM_NAME + " || Add Product", PLATFORM_NAME, adminData, productCategories});

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
  
const deleteProductGET = async (req,res)=>{

  try{

    const productId = req.params.id;
  
    await productHelpers.deleteProduct(productId);
  
    res.redirect('/admin/manage-products');

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

    const singleProductImageDeletionerror = req.session.singleProductImageDeletionError;
  
    res.render('admin/edit-product',{ layout: 'admin-layout', title:"Edit product", admin:true, adminData, PLATFORM_NAME, productDetails, productCategory, allProductCategories, singleProductImageDeletionerror });

    delete req.session.singleProductImageDeletionError;

  }catch(error){

    console.log("Error from editProductGET productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const editProductPOST = (req,res)=>{

  try{

    const productId = req.params.id;

    let updatedProductData = req.body;

    let productImageArray = [];

    updatedProductData.images = productImageArray;

    if(req.files.length > 0){

      for (let i = 0; i < req.files.length; i++) {
  
        productImageArray[i] = req.files[i].filename;
  
      }
  
      updatedProductData.images = productImageArray;

    }

    productHelpers.updateProduct(productId,updatedProductData).then(()=>{
  
      res.redirect('/admin/manage-products');
  
    })

  }catch(error){

    console.log("Error from editProductPOST productController: ", error);

    res.redirect('/admin/error-page');

  }

}


const deleteSingleProductImagePOST = async (req,res)=>{

  try{

    const productId = req.body.productId;

    const imageName = req.body.imageName;

    const deleteSingleProductImage = await productHelpers.deleteSingleProductImage( productId, imageName );

    if(deleteSingleProductImage.status){

      res.json({status:true});

    }else{

      req.session.singleProductImageDeletionError = deleteSingleProductImage.errorStatus;

      res.json({status:true});

    }

  }catch(error){

    console.log("Error from deleteSingleProductImagePOST productController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
  
// ====================Controllers for PRODUCT CATEGORIES====================
  
const productCategoriesGET = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const productCategories = await adminHelpers.getProductCategories();
  
    res.render('admin/view-product-categories', { layout: 'admin-layout', title: PLATFORM_NAME + " || Product Categories", PLATFORM_NAME, admin:true, adminData, productCategories});

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
  
    await adminHelpers.checkProductCategoryExists(categoryDetails.name).then( async (response)=>{
  
      if(response.status){ // The Product category Already Exist - Denying the addition of category to prevent Duplication
        
        req.session.adminSession.categoryExistsErr = response.message; // Storing the error message in Admin session for displaying to Admin
  
        res.redirect('/admin/add-new-product-category');
  
      }else{ // Product category Dosen't exist - Adding the Product Category
  
        categoryDetails.creatorDetails = {
  
          name:adminData.name,
      
          id: adminData._id
      
        }
      
        categoryDetails.createdOn = new Date();

        categoryDetails.categoryOffer = 0;

        const categoryImage = req.file.filename;
        
        categoryDetails.categoryImage = categoryImage;
      
        const productCategoryAddition = await adminHelpers.addProductCategory(categoryDetails);

        res.redirect('/admin/add-new-product-category');
  
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
  deleteSingleProductImagePOST,
  productCategoriesGET,
  addProductCategoryGET,
  addProductCategoryPOST,
  editProductCategoryGET,
  editProductCategoryPOST,
  deleteProductCategoryPOST

}