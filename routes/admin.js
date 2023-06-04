const express = require('express');
const router = express.Router();
const productHelper = require('../helpers/product-helpers');
const adminHelper = require('../helpers/admin-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"


/*=======================================MIDDLEWARES=======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyAdminLogin = (req,res,next)=>{

  if(req.session.adminLoggedIn){

    next();

  }else{

    res.redirect('/admin/login')

  }

}


/* ========================LOGIN & LOGOUT ROUTES======================== */

router.get('/login', (req,res)=>{

  if(req.session.adminSession){

    res.redirect('/admin');

  }else{

    res.render('admin/admin-login',{"loginError":req.session.adminLogginErr, title:PLATFORM_NAME + " || Admin Login", admin:true, PLATFORM_NAME});

    req.session.adminLogginErr = false; 
    /*
    Resetting the flag for checking if the login page post request was due to invalid username or password.
    This is done so that the login page will show the message only once if there was a redirect to this page due to invalid credentials.
    */
    
  }

})

router.post('/login',(req,res)=>{

  if(req.session.adminLoggedIn){

    res.redirect('/admin');

  }else{

    adminHelper.doAdminLogin(req.body).then((doAdminLoginResponse)=>{

      if(doAdminLoginResponse.status){
  
        req.session.adminSession = doAdminLoginResponse.adminData; // Storing response from doAdminLogin function in session storage
  
        req.session.adminLoggedIn = true;
  
        res.redirect('/admin');
  
      }else if(doAdminLoginResponse.emailError){
  
        req.session.adminLogginErr = "Admin Email Invalid !!!"; 
        /*Setting a flag for keeping a record of the login error which happened due to admin entering invalid credentials.
         This flag will be checked in every login request so that we can display an error message in the case of reloading the login page due to invalid credentials entered by admin.
         This flag variable is stored in the session using req.session so that it will be accesible everywhere.
         The name of this flag variable can be anything ie, this is NOT an predefined name in the session module.
        */
  
        res.redirect('/admin/login');
  
      }else{
  
        req.session.adminLogginErr = "Incorrect Password Entered!!!";
  
        res.redirect('/admin/login');
  
      }
  
    })
    
  }

})

router.post('/logout',(req,res)=>{

  req.session.adminSession = false;

  req.session.adminLoggedIn = false;

  res.redirect('/admin')

})

// ====================Routes to Add New Admin====================
router.get('/add-admin', verifyAdminLogin, (req, res)=>{

  res.render('admin/add-admin',{title:PLATFORM_NAME + " || Add Admin", admin:true, PLATFORM_NAME});

});

router.post('/add-admin', verifyAdminLogin, (req, res)=>{

  adminHelper.addNewAdmin(req.body).then((result)=>{
   
    res.redirect('/admin/add-admin');
    
  })


});

// ====================Route to Admin Dashboard====================
router.get('/', verifyAdminLogin, (req, res)=>{

  let adminData = req.session.adminSession;

  productHelper.getAllProducts().then((products)=>{
   
    res.render('admin/view-products',{title: PLATFORM_NAME + " || Admin Panel", admin:true, adminData, PLATFORM_NAME, products});
    
  })


});

// ====================Route to Add NEW Product Page====================
router.get('/add-product', verifyAdminLogin, async (req,res)=>{

  let adminData = req.session.adminSession;

  let productCategories = await adminHelper.getProductCategories();

  res.render('admin/add-product',{title: PLATFORM_NAME + " || Add Product",admin:true, adminData, PLATFORM_NAME, productCategories})

});

router.post('/add-product', verifyAdminLogin, (req,res)=>{

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

});


// ====================Route to DELETE a PRODUCT====================

router.get('/delete-product/:id', verifyAdminLogin, (req,res)=>{

  let productId = req.params.id;

  let productImageId = productId

  productHelper.deleteProduct(productId,productImageId).then((response)=>{
    // console.log(response);
  })

  res.redirect('/admin');

})


// ====================Routes to EDIT a PRODUCT====================

router.get('/edit-product/:id', verifyAdminLogin, (req,res)=>{

  let adminData = req.session.adminSession;

  let productID = req.params.id;

  let product = productHelper.getProductDetails(productID).then((productDetails)=>{

    // console.log(productDetails);

    res.render('admin/edit-product',{title:"Edit product", admin:true, adminData, PLATFORM_NAME, productDetails});

  })

})

router.post('/edit-product/:id', verifyAdminLogin, (req,res)=>{

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

})


// ====================Routes for PRODUCT CATEGORIES====================

router.get('/product-categories', verifyAdminLogin, async (req,res)=>{

  let adminData = req.session.adminSession;

  let productCategories = await adminHelper.getProductCategories();

  res.render('admin/view-product-categories', {title: PLATFORM_NAME + " || Product Categories", admin:true, adminData, productCategories});

});

router.get('/add-new-product-category', verifyAdminLogin, (req,res)=>{

  let adminData = req.session.adminSession;

  res.render('admin/add-product-category', {title: PLATFORM_NAME + " || Add Product Category", admin:true, adminData});

});

router.post('/add-new-product-category', verifyAdminLogin, (req,res)=>{

  let adminData = req.session.adminSession;

  let categoryDetails = req.body;

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

})

router.get('/edit-product-category/:categoryId', verifyAdminLogin, async (req,res)=>{

  let adminData = req.session.adminSession;

  let categoryId = req.params.categoryId;

  adminHelper.getProductCategoryDetails(categoryId).then((productCategoryData)=>{

    res.render('admin/edit-product-category', {title: PLATFORM_NAME + " || Edit Product Category", admin:true, adminData, productCategoryData});

  })

});

router.post('/edit-product-category/:categoryId', verifyAdminLogin, async (req,res)=>{

  let categoryId = req.params.categoryId;

  let updatedData = {

    categoryId : req.body.categoryId,

    name : req.body.name,

    description : req.body.description,

    updatedOn: new Date()

  }

  adminHelper.updateProductCategory(categoryId, updatedData).then(()=>{

    res.redirect('/admin/product-categories');

  })

});

router.post('/delete-product-category/:categoryId', verifyAdminLogin, async (req,res)=>{

  let categoryId = req.params.categoryId;

  adminHelper.deleteProductCategory(categoryId).then(()=>{

    res.redirect('/admin/product-categories');

  })

});










module.exports = router;
