const express = require('express');
const router = express.Router();
const productHelper = require('../helpers/product-helpers');
const vendorHelper = require('../helpers/vendor-helpers');
const vendorMiddlewares = require('../middlewares/vendorMiddlewares');

require('dotenv').config(); // Module to Load environment variables from .env file


let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"


/*=======================================MIDDLEWARES=======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyVendorLogin = vendorMiddlewares.verifyVendorLogin;

/* ========================VENDOR SIGN-UP ROUTES======================== */

router.get('/signup', (req,res)=>{

    res.render('vendor/vendor-signup',{title:PLATFORM_NAME + " || Vendor Sign-up", vendor:true, PLATFORM_NAME});
  
})
  
router.post('/signup',(req,res)=>{

    vendorHelper.doVendorSignup(req.body).then((vendorData)=>{
        
        // console.log(user);

        req.session.vendorSession = vendorData;

        req.session.vendorLoggedIn = true;

        res.redirect('/vendor');

    })

})


/* ========================LOGIN & LOGOUT ROUTES======================== */

router.get('/login', (req,res)=>{

  if(req.session.vendorSession){

    res.redirect('/vendor');

  }else{

    res.render('vendor/vendor-login',{"loginError":req.session.vendorLogginErr, title:PLATFORM_NAME + " || Vendor Login", vendor:true, PLATFORM_NAME});

    req.session.vendorLogginErr = false; 
    /*
    Resetting the flag for checking if the login page post request was due to invalid username or password.
    This is done so that the login page will show the message only once if there was a redirect to this page due to invalid credentials.
    */
    
  }

})

router.post('/login',(req,res)=>{

  if(req.session.vendorLoggedIn){

    res.redirect('/vendor');

  }else{

    vendorHelper.doVendorLogin(req.body).then((doVendorLoginResponse)=>{

      if(doVendorLoginResponse.status){
  
        req.session.vendorSession = doVendorLoginResponse.vendorData; // Storing response from doVendorLogin function in session storage
  
        req.session.vendorLoggedIn = true;
  
        res.redirect('/vendor');
  
      }else if(doVendorLoginResponse.emailError){
  
        req.session.vendorLogginErr = "Entered Email is Invalid !!!"; 
        /*Setting a flag for keeping a record of the login error which happened due to vendor entering invalid credentials.
         This flag will be checked in every login request so that we can display an error message in the case of reloading the login page due to invalid credentials entered by vendor.
         This flag variable is stored in the session using req.session so that it will be accesible everywhere.
         The name of this flag variable can be anything ie, this is NOT an predefined name in the session module.
        */
  
        res.redirect('/vendor/login');
  
      }else{
  
        req.session.vendorLogginErr = "Incorrect Password Entered!!!";
  
        res.redirect('/vendor/login');
  
      }
  
    })
    
  }

})

router.post('/logout',(req,res)=>{

  req.session.vendorSession = false;

  req.session.vendorLoggedIn = false;

  res.redirect('/vendor')

})


// ====================Route to Vendor Dashboard====================
router.get('/', verifyVendorLogin, (req, res)=>{

  let vendorData = req.session.vendorSession;

  productHelper.getAllProducts().then((products)=>{
   
    res.render('vendor/view-products',{title: PLATFORM_NAME + " || Seller Dashboard", vendor:true, vendorData, PLATFORM_NAME, products});
    
  })


});

// ====================Route to Add NEW Product====================
router.get('/add-product', verifyVendorLogin, (req,res)=>{

  let vendorData = req.session.vendorSession;

  res.render('vendor/add-product',{title: PLATFORM_NAME + " || Add Product",vendor:true, vendorData, PLATFORM_NAME})

});

router.post('/add-product', verifyVendorLogin, (req,res)=>{

  productHelper.addProduct(req.body,(result)=>{

    let vendorData = req.session.vendorSession;

    let id = result.insertedId

    let image = req.files.image;

    image.mv('./public/product-images/' + id +'.jpg',(err,done)=>{

      if(err){

        console.log(err);

      }else{

        res.redirect('/vendor/add-product');

      }

    });

  });

});


// ====================Route to DELETE a PRODUCT====================

router.get('/delete-product/:id', verifyVendorLogin, (req,res)=>{

  let productId = req.params.id;

  let productImageId = productId

  productHelper.deleteProduct(productId,productImageId).then((response)=>{
    // console.log(response);
  })

  res.redirect('/vendor');

})


// ====================Routes to EDIT A PRODUCT====================

router.get('/edit-product/:id', verifyVendorLogin, (req,res)=>{

  let vendorData = req.session.vendorSession;

  let productID = req.params.id;

  productHelper.getProductDetails(productID).then((productDetails)=>{

    // console.log(productDetails);

    res.render('vendor/edit-product',{title:"Edit product", vendor:true, vendorData, PLATFORM_NAME, productDetails});

  })

})

router.post('/edit-product/:id', verifyVendorLogin, (req,res)=>{

  let productId = req.params.id;

  productHelper.updateProduct(productId,req.body).then(()=>{

    /*
    Redirect the user to vendor page first, if there is any new image uploaded, update that in server after redirecting user.
    This will prevent user from keeping the user waiting in the edit page itself till the image gets uploaded.
    */
    res.redirect('/vendor')

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











module.exports = router;
