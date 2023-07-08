/*======================================= VENDOR CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const vendorHelper = require('../../helpers/vendor-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"



/* ========================LOGIN & LOGOUT Controllers======================== */

const vendorLogInGET = (req,res)=>{

  try{

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

  }catch(error){

    console.log("Error from vendorLogInGET vendorController: ", error);

    res.redirect('/error-page');

  }

}

const vendorLogInPOST = (req,res)=>{

  try{

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

  }catch(error){

    console.log("Error from vendorLogInPOST vendorController: ", error);

    res.redirect('/error-page');

  }

}

const vendorLogOutPOST = (req,res)=>{

  try{

    req.session.vendorSession = false;

    req.session.vendorLoggedIn = false;
  
    res.redirect('/vendor');

  }catch(error){

    console.log("Error from vendorLogOutPOST vendorController: ", error);

    res.redirect('/error-page');

  }

}


/* ========================VENDOR SIGN-UP Controllers======================== */

const vendorSignUpGET = (req,res)=>{

  try{

    res.render('vendor/vendor-signup',{title:PLATFORM_NAME + " || Vendor Sign-up", vendor:true, PLATFORM_NAME});

  }catch(error){

    console.log("Error from vendorSignUpGET vendorController: ", error);

    res.redirect('/error-page');

  }

}
  
const vendorSignUpPOST = (req,res)=>{

  try{

    vendorHelper.doVendorSignup(req.body).then((vendorData)=>{
  
      req.session.vendorSession = vendorData;
  
      req.session.vendorLoggedIn = true;
  
      res.redirect('/vendor');
  
    });

  }catch(error){

    console.log("Error from vendorSignUpPOST vendorController: ", error);

    res.redirect('/error-page');

  }

}


// ====================Controller for Vendor Dashboard====================

const vendorDashboardGET =  (req, res)=>{

  try{

    const vendorData = req.session.vendorSession;

    productHelpers.getAllProducts().then((products)=>{
     
      res.render('vendor/view-products',{title: PLATFORM_NAME + " || Seller Dashboard", vendor:true, vendorData, PLATFORM_NAME, products});
      
    });

  }catch(error){

    console.log("Error from vendorDashboardGET vendorController: ", error);

    res.redirect('/error-page');

  }

}







module.exports = {

  vendorLogInGET,
  vendorLogInPOST,
  vendorLogOutPOST,
  vendorSignUpGET,
  vendorSignUpPOST,
  vendorDashboardGET

}