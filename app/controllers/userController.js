/*======================================= USER CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const userHelpers = require('../../helpers/user-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const couponHelpers = require('../../helpers/coupon-helpers');
const offerHelpers = require('../../helpers/offer-helpers');
const bannerImageHelpers = require('../../helpers/bannerImage-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"


/* ========================HOME Page Controller======================== */

const homePageGET = async (req, res, next)=>{

  try{

    let user = req.session.userSession //used for authenticating a user visit if user has already logged in earlier

    let productCategories = await adminHelpers.getProductCategories();

    let cartCount = 0;

    let wishlistCount = 0;

    const bannerImages = await bannerImageHelpers.getAllBannerImages();

    if(user){

      cartCount = await userHelpers.getCartCount(req.session.userSession._id);

      wishlistCount = await userHelpers.getWishlistCount(user._id);

    }

    productHelpers.getAllProducts().then((products)=>{

      if(user){

        res.render('user/user-home', { layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME, admin:false, user, bannerImages, products, productCategories, cartCount, wishlistCount });

      }else{

        res.render('user/user-home', { layout: 'user-layout', title:PLATFORM_NAME, admin:false, bannerImages, products, productCategories });

      }

    });

  }catch(error){

    console.log("Error from homePageGET userController: ", error);

    res.redirect('/error-page');

  }
  
}
  

/* ========================USER LOGIN / LOGOUT Controllers======================== */
  
const userLogInGET = (req,res)=>{

  try{

    if(req.session.userLoggedIn){

      res.redirect('/');
  
    }else{
  
      res.render('user/login',{ layout: 'user-layout', "loginError":req.session.userLogginErr, title:PLATFORM_NAME + " || Login", admin:false});
  
      delete req.session.userLogginErr; 
      /*
      Resetting the flag for checking if the login page post request was due to invalid username or password.
      This is done so that the login page will show the message only once if there was a redirect to this page due to invalid credentials.
      */
      
    }

  }catch(error){

    console.log("Error from userLogInGET userController: ", error);

    res.redirect('/error-page');

  }
  
}
  
const userLogInPOST = (req,res)=>{

  try{

    if(req.session.userLoggedIn){

      res.redirect('/');
  
    }else{
  
      userHelpers.doUserLogin(req.body).then((doUserLoginResponse)=>{
  
        if(doUserLoginResponse.status){
    
          req.session.userSession = doUserLoginResponse.userData; // Storing response from doAdminLogin function in session storage
    
          req.session.userLoggedIn = true;
    
          res.redirect('/');
    
        }else if(doUserLoginResponse.emailError){
    
          req.session.userLogginErr = "Email Invalid !!!"; 
          /*Setting a flag for keeping a record of the login error which happened due to admin entering invalid credentials.
            This flag will be checked in every login request so that we can display an error message in the case of reloading the login page due to invalid credentials entered by admin.
            This flag variable is stored in the session using req.session so that it will be accesible everywhere.
            The name of this flag variable can be anything ie, this is NOT an predefined name in the session module.
          */
    
          res.redirect('/login');
    
        }else if(doUserLoginResponse.passwordError){
    
          req.session.userLogginErr = "Invalid Password Entered!!!";
    
          res.redirect('/login');
    
        }else if(doUserLoginResponse.blockedUser) {
  
          // If the user is blocked
  
          req.session.blockedUser = true;
  
          req.session.userLogginErr = "We are extremely sorry to inform that your account has been temporarily suspended - Please contact the Site Admin for resolution";
    
          res.redirect('/login');
  
        }else{
  
          req.session.userLogginErr = "oops! something went wrong and we couldn't process your login request - please contact site admin for resolution";
    
          res.redirect('/login');
  
        }
    
      })
      
    }

  }catch(error){

    console.log("Error from userLogInPOST userController: ", error);

    res.redirect('/error-page');

  }

}
  
const userLogOutPOST = (req,res)=>{

  try{

    delete req.session.userSession;

    delete req.session.userLoggedIn;

    res.redirect('/');

  }catch(error){

    console.log("Error from userLogOutPOST userController: ", error);

    res.redirect('/error-page');

  }

}
  
  
/* ========================USER SIGN-UP Controllers======================== */
  
const userSignUpGET = (req,res)=>{

  try{

    const existingUserError = req.session.userDataAlreadyExistError;
  
    res.render('user/signup',{ layout: 'user-layout', title:PLATFORM_NAME + " || Sign-up", user:true, existingUserError});

    delete req.session.userDataAlreadyExistError;

  }catch(error){

    console.log("Error from userSignUpGET userController: ", error);

    res.redirect('/error-page');

  }

}
  
const userSignUpPOST = async (req,res)=>{

  try{

    const signUpFormData = req.body;
  
    req.session.userSignupData = signUpFormData; // Storing the sign-up data in session for further use in verification routes

    const emailAndUserNameVerification = await userHelpers.verifyDuplicateUserSignUpData(signUpFormData);

    if(emailAndUserNameVerification.success){

      userHelpers.createUserSignUpOtp(signUpFormData).then((response)=>{

        if(response.statusMessageSent){
    
          req.session.signUpOtpFromTwilioAwaited = true;
          
          res.redirect('/verify-user-signup');
    
        }else{
    
          let signUpErrMessage = "Unable to sent OTP to the provided phone number, Please re-check the number!";
    
          res.render('user/signup',{ layout: 'user-layout', title:PLATFORM_NAME + " || Sign-up", user:true, signUpErrMessage});
    
        }
    
      })

    }else{ // If the user Email or Username already exist in the DB, signup page will be rendered with a errror message and instruction.

      req.session.userDataAlreadyExistError = emailAndUserNameVerification;

      res.redirect('/signup');

    }

  }catch(error){

    console.log("Error from userSignUpPOST userController: ", error);

    res.redirect('/error-page');

  }

}
  
const verifyUserSignUpGET = (req,res)=>{

  try{

    if(req.session.userSignupData && req.session.signUpOtpFromTwilioAwaited ){

      res.render('user/sign-in-otp-validation',{ layout: 'user-layout', title:PLATFORM_NAME + " || Verify Sign-Up OTP", user:true});
  
    }else{
  
      res.redirect('/signup');
  
    }

  }catch(error){

    console.log("Error from verifyUserSignUpGET userController: ", error);

    res.redirect('/error-page');

  }
  
}


const reSendUserSignUpOTPGET = (req, res) => {

  try {

    if (req.session.userSignupData && req.session.signUpOtpFromTwilioAwaited ) {

      delete req.session.signUpOtpFromTwilioAwaited;

      res.render('user/signup-resend-otp', { layout: 'user-layout', title: PLATFORM_NAME + " || Re-send Sign-Up OTP" });

    } else {

      res.redirect('/signup');

    }

  } catch (error) {

    console.log("Error from reSendUserSignUpOTPGET userController: ", error);

    res.redirect('/error-page');

  }

}

const requestToReSendUserSignUpOTPPOST = (req, res) => {

  try {

    req.session.signUpOtpFromTwilioAwaited = true;

    const signUpFormData = req.session.userSignupData; // Retriving the sign-up data in session for Re-sending otp.

    if (signUpFormData) {

      userHelpers.createUserSignUpOtp(signUpFormData).then((response)=>{

        if(response.statusMessageSent){
    
          req.session.signUpOtpFromTwilioAwaited = true;
          
          res.redirect('/verify-user-signup');
    
        }else{
    
          let signUpErrMessage = "Unable to sent OTP to the provided phone number, Please re-check the number!";
    
          res.render('user/signup',{ layout: 'user-layout', title:PLATFORM_NAME + " || Sign-up", user:true, signUpErrMessage});
    
        }
    
      })

    } else {

      res.redirect('/signup');

    }

  } catch (error) {

    console.log("Error from requestToReSendUserSignUpOTPPOST userController: ", error);

    res.redirect('/error-page');

  }

}


  
const verifyUserSignUpPOST = (req,res)=>{

  try{

    const otpFromUser = req.body.otp;

    const userSignUpRequestData = req.session.userSignupData;

    const userPhoneNumber = userSignUpRequestData.phone;

    userHelpers.verifyUserSignUpOtp(otpFromUser, userPhoneNumber).then((verificationData)=>{

      if(verificationData.verified){

        userHelpers.doUserSignup(userSignUpRequestData).then((userData)=>{
      
          delete req.session.signUpOtpFromTwilioAwaited
      
          req.session.userSession = userData;
      
          req.session.userLoggedIn = true;

          delete req.session.userSignupData;
          // Deleting the userData that was stored in session after the user succesfully sign-In (To prevent session storage being unnecassarily used)
      
          res.redirect('/');
      
        })

      }else{

        let otpError = verificationData.otpErrorMessage

        res.render('user/sign-in-otp-validation',{ layout: 'user-layout', title:PLATFORM_NAME + " || Verify OTP", user:true, otpError});

      }

    })

  }catch(error){

    console.log("Error from verifyUserSignUpPOST userController: ", error);

    res.redirect('/error-page');

  }
  
}


/* ======================== FORGOT PASSWORD Controllers ======================== */

const forgotPasswordGET = (req, res) => {

  try {

    const userPasswordResetError = req.session.userPasswordResetError;

    res.render('user/forgot-password', { layout: 'user-layout', title: PLATFORM_NAME + " || Forgot password", userPasswordResetError });

    delete req.session.userPasswordResetError;

  } catch (error) {

    console.log("Error from forgotPasswordGET userController: ", error);

    res.redirect('/error-page');

  }

}

const verifyAccountForPasswordResetPOST = async (req, res) => {

  try {

    const requestedEmail = req.body.requestEmail;

    const userData = await userHelpers.findUserwithEmail(requestedEmail);

    req.session.userDataForPasswordReset = userData;

    if(userData === null){

      req.session.userPasswordResetError = "We coudn't find your details in our platform users data, please check ypur email or sign-up if not registered.";

      res.redirect('/forgot-password');

    }else{ // Proceed Sending an OTP as 2FA to the user mobile number

      const userMobileNumber = userData.phone;

      const sendOtpToUser = await userHelpers.createVerificationOTPWithTwilio(userMobileNumber);

      if(sendOtpToUser.statusMessageSent){
    
        req.session.passwordResetOtpFromTwilioAwaited = true;
        
        res.redirect('/password-reset-otp');
  
      }else{
  
        req.session.userPasswordResetError = "We could't send OTP to your mobile, please retry!"
  
        res.redirect('/forgot-password');
  
      }

    }

  } catch (error) {

    console.log("Error from verifyAccountForPasswordResetPOST userController: ", error);

    res.redirect('/error-page');

  }

}

const verifyOTPForPasswordResetGET = async (req, res) => {

  try {

    if(req.session.passwordResetOtpFromTwilioAwaited){

      const userPasswordResetError = req.session.userPasswordResetError;

      res.render('user/password-reset-otp-submission', { layout: 'user-layout', title: PLATFORM_NAME + " || Password Reset OTP", userPasswordResetError });

      delete req.session.userPasswordResetError;

    }else{

      res.redirect('/forgot-password');

    }

  } catch (error) {

    console.log("Error from verifyOTPForPasswordResetGET userController: ", error);

    res.redirect('/error-page');

  }

}


const verifyOTPForPasswordResetPOST = async (req, res) => {

  try {

    if(req.session.passwordResetOtpFromTwilioAwaited){

      const requestedOTP = req.body.otpToVerify;

      const userData = req.session.userDataForPasswordReset;

      const userMobileNumber = userData.phone;

      userHelpers.verifyOTPCreatedWithTwilio(requestedOTP, userMobileNumber).then((verificationData)=>{

        if(verificationData.verified){

          req.session.userPasswordResetAllowed = true;
  
          res.render('user/password-set-new', { layout: 'user-layout', title: PLATFORM_NAME + " || Reset password" });

          delete req.session.passwordResetOtpFromTwilioAwaited;
  
        }else{
  
          req.session.userPasswordResetError = verificationData.otpErrorMessage;
  
          res.redirect('/password-reset-otp');
  
        }
  
      })

    }else{

      res.redirect('/forgot-password');

    }

  } catch (error) {

    console.log("Error from verifyOTPForPasswordResetGET userController: ", error);

    res.redirect('/error-page');

  }

}


const resetUserPasswordPOST = async (req, res) => {

  try {

    if(req.session.userPasswordResetAllowed){

      delete req.session.userPasswordResetAllowed;

      const userData = req.session.userDataForPasswordReset;

      const userId = userData._id;

      const requestedNewUserPassword = req.body.newPassword;

      const updatePassword = await userHelpers.resetUserPassword(userId, requestedNewUserPassword);

      res.redirect('/login');

      delete req.session.userDataForPasswordReset;

    }else{

      res.redirect('/forgot-password');

    }

  } catch (error) {

    console.log("Error from verifyOTPForPasswordResetGET userController: ", error);

    res.redirect('/error-page');

  }

}

/* ======================== USER PROFILE Controllers ======================== */

const userProfileGET =  async (req, res) => {

  try{

    const user = req.session.userSession;

    const userName = req.params.userName;

    if( user.userName === userName ){

      const userData = await userHelpers.getUserDataWithUserName(userName);

      const cartCount = await userHelpers.getCartCount(userData._id);

      const ordersCount = await userHelpers.getOrdersCount(userData._id);

      const primaryAddress = await userHelpers.getUserPrimaryAddress(userData._id);

      const wishlistCount = await userHelpers.getWishlistCount(userData._id);

      const userWalletData = await userHelpers.getUserWalletData(userData._id);
    
      if(primaryAddress){

        res.render('user/user-profile', { layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Profile", PLATFORM_NAME, admin:false, user, userData, userWalletData, cartCount, ordersCount, primaryAddress, wishlistCount });

      }else{

        res.render('user/user-profile', { layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Profile", PLATFORM_NAME, admin:false, user, userData, userWalletData, cartCount, ordersCount, wishlistCount });

      }

    }else{ 
      
      // If the username in the request url is not same as the username stored in the session, restricting the access as the user will be able to access other users profile page with their user name.

      res.redirect('/access-forbidden');

    }

  }catch(error){

    console.log("Error from userProfileGET userController: ", error);

    res.redirect('/error-page');

  }

}

const userProfileUpdateRequestPOST =  async (req, res) => {

  try{

    const user = req.session.userSession;

    const userId = user._id;

    const userName = user.userName;

    const formData = {

      name : req.body.name,

      lastName : req.body.lastName,

      age : req.body.age,

      phoneNumberAlternative : req.body.phoneNumberAlternative,

      userTagline : req.body.userTagline

    }
    
    userHelpers.updateUserData(userId, formData).then((response)=>{

      if(response.success){

        res.redirect("/profile/" + userName);

      }else{

        res.redirect("/error-page");

      }

    }).catch((error)=>{

      console.log("Error from updateUserData userHelper at userProfileUpdateRequestPOST controller : ", error);
      
    });

  }catch(error){

    console.log("Error from userProfileUpdateRequestPOST userController: ", error);

    res.redirect('/error-page');

  }

}


/* ======================== Single Product Page Controller ======================== */

const singleProductPageGET =  (req, res) => {

  try{

    let user = req.session.userSession;
    let productId = req.params.id;

    productHelpers.getProductDetails(productId).then(async (productDetails) => {

      if (user) {

        cartCount = await userHelpers.getCartCount(req.session.userSession._id);

        const wishlistCount = await userHelpers.getWishlistCount(user._id);

        res.render('user/single-product-page', { layout: 'user-layout', title: user.name + "'s " + PLATFORM_NAME + " || " + productDetails.name, admin: false, user: true, user, cartCount, productDetails, wishlistCount });

      } else {

        res.render('user/single-product-page', { layout: 'user-layout', title: PLATFORM_NAME + " || " + productDetails.name, admin:false, productDetails });
        
      }

    }).catch((error) => {

      console.log("Error from getProductDetails userHelper at singleProductPageGET userController : " , error);

    });

  }catch(error){

    console.log("Error from singleProductPageGET userController: ", error);

    res.redirect('/error-page');

  }
    
}


/* ======================== Category Page Controller ======================== */

const categoryWiseProductsGET =  async (req, res) => {

  try{

    const user = req.session.userSession;

    const categoryName = req.params.categoryName;

    let cartCount = 0;

    let wishlistCount = 0;

    if(user){

      cartCount = await userHelpers.getCartCount(req.session.userSession._id);

      wishlistCount = await userHelpers.getWishlistCount(user._id);

    }

    const products = await productHelpers.getProductsWithCategoryName(categoryName);

    const dataToRender = {

      layout: 'user-layout',
      title: PLATFORM_NAME + " || " + categoryName,
      user,
      categoryName,
      products,
      cartCount,
      wishlistCount

    }

    res.render('user/products-listing-category-wise', dataToRender );

  }catch(error){

    console.log("Error from categoryWiseProductsGET userController: ", error);

    res.redirect('/error-page');

  }
    
}


/* ======================== USER WISHLIST Controllers ======================== */

const userWishlistGET =  async (req, res) => {

  try {

    const user = req.session.userSession;

    const userId = req.session.userSession._id;

    const cartCount = await userHelpers.getCartCount(userId);

    const userWishlistData = await userHelpers.getUserWishListData(userId);

    const wishlistCount = await userHelpers.getWishlistCount(userId);

    if(userWishlistData != null){

      res.render('user/manage-wishlist', { layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Wishlist", PLATFORM_NAME, user, cartCount, wishlistCount, userWishlistData });

    }else{

      res.render('user/manage-wishlist', { layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Wishlist", PLATFORM_NAME, user, cartCount, wishlistCount });

    }
    
  } catch (error) {

    console.log("Error from userWishlistGET controller : ", error);

    res.redirect("/error-page");
    
  }

}

const modifyUserWishlistPOST =  async (req, res) => {

  try {

    const user = req.session.userSession;

    const userId = user._id;

    const productId = req.body.productId

    await userHelpers.addOrRemoveFromWishList(productId, userId).then((response)=>{

      if (response.status) {

        res.status(200).json({ status: "added" });

      } else if (response.removed) {

        res.status(200).json({ status: "removed" });

      }

    })
    
  } catch (error) {

    console.log("Error from modifyUserWishlistPOST controller : ", error);

    res.redirect("/error-page");
    
  }

}


/* ======================== USER ADDRESS Controllers ======================== */

const manageUserAddressGET =  async (req, res) => {

  try {
   
    const user = req.session.userSession;

    const userId = user._id;

    const userCollectionData = await userHelpers.getUserData(userId);

    const cartCount = await userHelpers.getCartCount(userId);

    const userAddress = await userHelpers.getUserAddress(userId);

    const wishlistCount = await userHelpers.getWishlistCount(user._id);

    if (userAddress && userAddress.length > 0){

      res.render('user/manage-address', { layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Manage Address", PLATFORM_NAME, admin:false, user, userCollectionData, cartCount, userAddress, wishlistCount });

    } else {

      res.render('user/manage-address', { layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Manage Address", PLATFORM_NAME, admin:false, user, userCollectionData, cartCount, wishlistCount });

    }

  } catch (error) {
    
    console.log("Error from manageUserAddressGET controller : ", error);

    res.redirect("/error-page");

  }  

}

const addNewAddressPOST =  async (req, res) => {

  try{

    const user = req.session.userSession;

    const userId = user._id;

    const addressData = {

      addressType : req.body.addressType,

      addressLine1 : req.body.addressLine1,

      addressLine2 : req.body.addressLine2,

      street : req.body.street,

      city : req.body.city,

      state : req.body.state,

      country  : req.body.country,

      postalCode : req.body.postalCode,

      contactNumber : req.body.contactNumber

    }

    userHelpers.insertUserAddress(userId,addressData).then((response)=>{

      res.redirect('/manage-my-address');

    })

  }catch(error){

    console.log("Error from addNewAddressPOST userController: ", error);

    res.redirect('/error-page');

  }

}

const editUserAddressPOST =  async (req, res) => {

  try{

    const user = req.session.userSession;

    const userId = user._id;

    const dataToUpdate = req.body;

    await userHelpers.editUserAddress(userId,dataToUpdate).then((response)=>{

      res.redirect('/manage-my-address')

    })

  }catch(error){

    console.log("Error from editUserAddressPOST userController: ", error);

    res.redirect('/error-page');

  }

}

const deleteUserAddressPOST =  async (req, res) => {

  try{

    const user = req.session.userSession;

    const userId = user._id;

    const addressId = req.body.addressId;

    await userHelpers.deleteUserAddress(userId,addressId).then((response)=>{

      res.json({status:true});

    })

  }catch(error){

    console.log("Error from deleteUserAddressPOST userController: ", error);

    res.redirect('/error-page');

  }

}

const changePrimaryAddressPOST =  async (req, res) => {

  try{

    const user = req.session.userSession;

    const userId = user._id;

    const addressId = req.body.addressId;

    await userHelpers.changePrimaryAddress(userId,addressId).then((response)=>{

      res.json({status:true});

    })

  }catch(error){

    console.log("Error from changePrimaryAddressPOST userController: ", error);

    res.redirect('/error-page');

  }

}


/* ======================== CART Controllers ======================== */

const cartGET = async (req,res)=>{

  try{

    let user = req.session.userSession //To pass user name to cart-page while rendering - used to display Custom title for page.

    let cartCount = null;

    if(user){

      cartCount = await userHelpers.getCartCount(req.session.userSession._id);

    }

    if(cartCount > 0){  // If there is atleast 1 item in the database, then calculate fetch items and value from db
      
      const cartItems = await offerHelpers.getCartItemsWithOfferData(user._id);

      const wishlistCount = await userHelpers.getWishlistCount(user._id);

      // The below function will return the original cart value without any discounts.
      const originalCartValue = await userHelpers.getCartValue(user._id);

      // ==================== Product Offer Discounts ====================
      let productOfferDiscounts = await offerHelpers.calculateProductOfferDiscountsForCart(user._id);
      productOfferDiscounts = productOfferDiscounts.totalCartDiscount;

      // ==================== Category Offer Discounts ====================
      let categoryOfferDiscounts = await offerHelpers.calculateCategoryOfferAmountForCart(user._id);
      categoryOfferDiscounts = categoryOfferDiscounts.totalCategoryDiscountAmount;

      // Finding the finalised cart value after substracting the offer amounts. 
      const cartValue = originalCartValue - productOfferDiscounts - categoryOfferDiscounts;

      res.render('user/cart',{ layout: 'user-layout', title: user.name + "'s " + PLATFORM_NAME + " || Cart" , admin:false, user, cartItems, cartCount, cartValue, wishlistCount });

    }else{ // If there is no items in the cart - then redirect to a different page to avoid the query to database for cartitems and cartvalue

      res.redirect('/empty-cart');

    }

  }catch(error){

    console.log("Error from cartGET userController: ", error);

    res.redirect('/error-page');

  }
  
}
  
const emptyCartGET = async (req,res)=>{

  try{

    let user = req.session.userSession //To pass user name to the page while rendering - used to display Custom title for page.

    if(user){

      cartCount = await userHelpers.getCartCount(req.session.userSession._id);

      const wishlistCount = await userHelpers.getWishlistCount(user._id);

      res.render('user/empty-cart',{ layout: 'user-layout', title: user.name + "'s " + PLATFORM_NAME + " || Empty Cart" , admin:false, user, cartCount, wishlistCount });

    }else{

      res.render('user/empty-cart',{ layout: 'user-layout', title: user.name + "'s " + PLATFORM_NAME + " || Empty Cart" , admin:false, wishlistCount });

    }

  }catch(error){

    console.log("Error from emptyCartGET userController: ", error);

    res.redirect('/error-page');

  }

}
  
const addToCartGET = (req,res)=>{

  try{

    userHelpers.addToCart(req.params.id,req.session.userSession._id).then(()=>{

      res.json({status:true});
  
    })

  }catch(error){

    console.log("Error from addToCartGET userController: ", error);

    res.redirect('/error-page');

  }
  
}
  
const changeCartProductQuantityPOST = (req,res,next)=>{

  try{

    const user = req.session.userSession;

    userHelpers.changeCartProductQuantity(req.body).then( async (response)=>{

      // The below function will return the original cart value without any discounts.
      const originalCartValue = await userHelpers.getCartValue(user._id);

      // ==================== Product Offer Discounts ====================
      let productOfferDiscounts = await offerHelpers.calculateProductOfferDiscountsForCart(user._id);
      productOfferDiscounts = productOfferDiscounts.totalCartDiscount;

      // ==================== Category Offer Discounts ====================
      let categoryOfferDiscounts = await offerHelpers.calculateCategoryOfferAmountForCart(user._id);
      categoryOfferDiscounts = categoryOfferDiscounts.totalCategoryDiscountAmount;

      // Finding the finalised cart value after substracting the offer amounts. 
      const discountedCartValue = originalCartValue - productOfferDiscounts - categoryOfferDiscounts;

      response.cartValue = discountedCartValue; // Adding a cartValue feild to response object 
  
      res.json(response); 
      /* 
      # Used JSON to send data back here as RESPONSE to AJAX Call from cart page
      # As we are using AJAX there is no need of sending back a complete web page or redirecting to a webpage (which will load the page completely)
      # We can configure the AJAX to use the data in JSON format for updating the specific element of webpage
      */
    
    }).catch((error)=>{
  
      console.log("Error from changeCartProductQuantity userHelper at changeCartProductQuantityPOST userController: ", error);
      
    });

  }catch(error){

    console.log("Error from changeCartProductQuantityPOST userController: ", error);

    res.redirect('/error-page');

  }

}
  
const deleteCartProductPOST = (req,res,next)=>{

  try{

    userHelpers.deleteProductFromCart(req.body).then((response)=>{

      res.json(response); 
      /* 
      # Used JSON to send data back here as RESPONSE to AJAX Call from cart page
      # As we are using AJAX there is no need of sending back a complete web page or redirecting to a webpage (which will load the page completely)
      # We can configure the AJAX to use the data in JSON format for updating the specific element of webpage
      */
    
    }).catch((error)=>{
    
      console.log("Error from deleteProductFromCart userHelper at deleteCartProductPOST userController: ", error);
      
    });

  }catch(error){

    console.log("Error from deleteCartProductPOST userController: ", error);

    res.redirect('/error-page');

  }

}


/* ========================ORDERS & PAYMENTS Controllers======================== */

const userOrdersGET = async (req,res)=>{

  try{

    const user = req.session.userSession // Used for storing user details for further use in this route

    const orderDetails = await userHelpers.getUserOrderHistory(user._id);

    const wishlistCount = await userHelpers.getWishlistCount(user._id);

    res.render('user/orders',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Orders" , admin:false, user, orderDetails, wishlistCount});

  }catch(error){

    console.log("Error from userOrdersGET userController: ", error);

    res.redirect('/error-page');

  }

}
  
const userOrderDetailsPOST = async (req,res)=>{

  try{

    const user = req.session.userSession // Used for storing user details for further use in this route

    const orderId = req.body.orderId;

    const productDetails = await userHelpers.getProductsInOrder(orderId);

    const orderDate = await userHelpers.getOrderDate(orderId); // For passing order date to the page

    const orderData = await userHelpers.getDetailedOrderData(orderId); // For passing order data to the page

    res.render('user/ordered-product-details',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Ordered Product Details" , admin:false, user, productDetails, orderData, orderDate});


  }catch(error){

    console.log("Error from userOrderDetailsPOST userController: ", error);

    res.redirect('/error-page');

  }

}

const placeOrderGET = async (req,res)=>{

  try{

    let user = req.session.userSession // Used for storing user details for further use in this route

    cartCount = await userHelpers.getCartCount(req.session.userSession._id);

    if(cartCount > 0){

      let cartProducts = await userHelpers.getCartProducts(user._id);

      let cartValue = await userHelpers.getCartValue(user._id);

      const userAddress = await userHelpers.getUserAddress(user._id);

      const wishlistCount = await userHelpers.getWishlistCount(user._id);

      const primaryAddress = await userHelpers.getUserPrimaryAddress(user._id);

      const originalCartValue = await userHelpers.getCartValue(user._id);

      // Coupon Request configuration
      let couponError = false;
      let couponApplied = false;

      if(req.session.couponInvalidError){

        couponError = req.session.couponInvalidError;

      }else if(req.session.couponApplied){

        couponApplied = req.session.couponApplied;

      }

      // ====================================== Coupon Discounts Calculation ======================================

      // Existing Coupon Status Validation & Discount amount calculation using couponHelper

      let couponDiscount = 0;

      const eligibleCoupon = await couponHelpers.checkCurrentCouponValidityStatus(user._id, cartValue);

      if(eligibleCoupon.status){

        couponDiscount = eligibleCoupon.couponDiscount;

      }else{

        couponDiscount = 0;

      }


      // Updating the cart value to display in the front-end after applying coupon discount - note that this will not be modify the cart value in the DB
      cartValue = cartValue - couponDiscount;

      // ========================================== Product Offer Discounts Calculation ==========================================

      // Finding existing product offer applicable to the cart and applying it to the cart value

      const applicableProductOffers = await offerHelpers.calculateProductOfferDiscountsForCart(user._id);

      const productOfferDiscount = applicableProductOffers.totalCartDiscount;

      // Updating the cart value to display in the front-end after applying product offer discount - note that this will not be modify the cart value in the DB
      cartValue = cartValue - productOfferDiscount;

      // ========================================== Category Offer Discounts Calculation ==========================================

      // Finding existing category offer applicable to the cart and applying it to the cart value

      const applicableCategoryOffers = await offerHelpers.calculateCategoryOfferAmountForCart(user._id);

      const categoryOfferDiscount = applicableCategoryOffers.totalCategoryDiscountAmount;

      // Updating the cart value to display in the front-end after applying category offer discount - note that this will not be modify the cart value in the DB
      cartValue = cartValue - categoryOfferDiscount;



      if(primaryAddress){

        res.render('user/place-order',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Order Summary" , admin:false, user, cartProducts, originalCartValue, cartValue, userAddress, primaryAddress, wishlistCount, couponApplied, couponError, couponDiscount, productOfferDiscount, categoryOfferDiscount });

        delete req.session.couponApplied;

        delete req.session.couponInvalidError;

      }else{

        res.render('user/place-order',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Order Summary" , admin:false, user, cartProducts, cartValue, userAddress, wishlistCount, couponApplied, couponError, couponDiscount, productOfferDiscount, categoryOfferDiscount });

        delete req.session.couponApplied;

        delete req.session.couponInvalidError;

      }

    }else{

      res.redirect('/empty-cart');
    }

  }catch(error){

    console.log("Error from placeOrderGET userController: ", error);

    res.redirect('/error-page');

  }

}
  
const placeOrderPOST = async (req,res)=>{

  try{

    let user = req.session.userSession // Used for storing user details for further use in this route

    let orderDetails = req.body;

    let orderedProducts = await userHelpers.getProductListForOrders(user._id);
    // This variable will store the product details if cart exist for user, else will store a boolean value false returned by the function

    if(orderedProducts){ // If there are products inside user cart , Proceed executing checkout functions

      // Finding the total order value of the cart without any discounts
      let totalOrderValue = await userHelpers.getCartValue(user._id);

      // Inserting the actual order value of the cart without any discounts for storing into the DB OrderDetails
      orderDetails.actualOrderValue = totalOrderValue;

      // ====================================== Coupon Discounts Calculation ======================================

      const availableCouponData = await couponHelpers.checkCurrentCouponValidityStatus(user._id, totalOrderValue);

      let couponDiscountAmount = 0;

      if(availableCouponData.status){

        couponDiscountAmount = availableCouponData.couponDiscount;

        // Updating the total order value with coupon discount applied
        totalOrderValue = totalOrderValue - couponDiscountAmount;

        const updateCouponUsedStatusResult = await couponHelpers.updateCouponUsedStatus(user._id, availableCouponData.couponId);

      }

      // Inserting the value of coupon discount into the order details object created above
      orderDetails.couponDiscount = couponDiscountAmount;


      // ========================================== Product Offer Discounts Calculation ==========================================

      // Finding existing product offer applicable to the cart and applying it to the cart value

      const applicableProductOffers = await offerHelpers.calculateProductOfferDiscountsForCart(user._id);

      const productOfferDiscount = applicableProductOffers.totalCartDiscount;

      // Inserting the value of product offer discount into the order details object created above
      orderDetails.productOfferDiscount = productOfferDiscount;

      // Updating the total order value with the eligible product offer discount
      totalOrderValue = totalOrderValue - productOfferDiscount;


      // ========================================== Category Offer Discounts Calculation ==========================================

      // Finding existing category offer applicable to the cart and applying it to the cart value

      const applicableCategoryOffers = await offerHelpers.calculateCategoryOfferAmountForCart(user._id);

      const categoryOfferDiscount = applicableCategoryOffers.totalCategoryDiscountAmount;

      // Inserting the value of category offer discount into the order details object created above
      orderDetails.categoryOfferDiscount = categoryOfferDiscount;

      // Updating the total order value with the eligible category offer discount
      totalOrderValue = totalOrderValue - categoryOfferDiscount;

      // =============================================== Proceeding for order Creation ===============================================

      userHelpers.placeOrder(user,orderDetails,orderedProducts,totalOrderValue).then((orderId)=>{

        if(req.body['payment-method']==='COD'){ // If the payment method is COD - send a status and directly place the order.

          res.json({COD_CHECKOUT:true});


          // ========================================== Inventory Updation ==========================================
          const updateInventory = userHelpers.updateInventoryOfOrder(user._id);

          // ================================ Delete user cart after succesful order ================================
          const deleteUserCart = userHelpers.deleteUserCart(user._id);

    
        }else if(req.body['payment-method']==='ONLINE'){
    
          userHelpers.generateRazorpayOrder(orderId,totalOrderValue).then((razorpayOrderDetails)=>{

            userHelpers.createPaymentHistory(user,orderId,orderDetails,totalOrderValue,razorpayOrderDetails);
            // Creating a new document in payment history collection in the Database with all the available data of the placed order

            const razorpayKeyId = process.env.RAZORPAY_KEY_ID

            res.json(

              {
                ONLINE_CHECKOUT:true,
                userDetails:user,
                userOrderRequestData:orderDetails,
                orderDetails:razorpayOrderDetails,
                razorpayKeyId:razorpayKeyId
              }
              
            );

          });
    
        }else{
    
          res.json({paymentStatus:false});

        }

      });

    }else{ // If there are NO products inside user cart , Send a status back in json

      res.json({checkoutStatus:false});

    }

  }catch(error){

    console.log("Error from placeOrderPOST userController: ", error);

    res.redirect('/error-page');

  }
 
}
  
const orderSuccessGET = (req,res)=>{

  try{

    const user = req.session.userSession // Used for storing user details for further use in this route

    res.render('user/order-success',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Order Placed!!!" , user});

  }catch(error){

    console.log("Error from orderSuccessGET userController: ", error);

    res.redirect('/error-page');

  }

}
  
const orderFailedGET = (req,res)=>{

  try{

    const user = req.session.userSession // Used for storing user details for further use in this route

    res.render('user/order-failed',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Sorry, Order failed" , admin:false, user});

  }catch(error){

    console.log("Error from orderFailedGET userController: ", error);

    res.redirect('/error-page');

  }

}
  
const verifyPaymentPOST = (req,res)=>{

  try{

    const user = req.session.userSession;

    // The below verifyOnlinePayment function will match the signature returned by Razorpay with our server generated signature
    userHelpers.verifyOnlinePayment(req.body).then(()=>{

      // The below function updateOnlineOrderPaymentStatus will be called upon succesful verification of payment by verifyOnlinePayment above
      // updateOnlineOrderPaymentStatus function will update the payment status in DB

      const receiptId = req.body['serverOrderDetails[receipt]'];

      const paymentSuccess = true;

      userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(()=>{

        // Sending the receiptId to the above userHelper to modify the order status in the DB
        // We have set the Receipt Id is same as the orders cart collection ID

        res.json({status:true});

        // console.log('Payment Succesful from Update online Orders');

      })


      // ========================================== Inventory Updation ==========================================
      const updateInventory = userHelpers.updateInventoryOfOrder(user._id);

      // ================================ Delete user cart after succesful order ================================
      const deleteUserCart = userHelpers.deleteUserCart(user._id);
      

    }).catch((error)=>{

      if(error){
        
        console.log("Error from verifyOnlinePayment userHelper at verifyPaymentPOST userController: ", error);

        const paymentSuccess = false;

        userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(()=>{

          // Sending the receiptId to the above userHelper to modify the order status in the DB
          // We have set the Receipt Id is same as the orders cart collection ID

          res.json({status:false});

          // console.log('Payment Failed from Update online Orders');

        })
      
      }

    });


  }catch(error){

    console.log("Error from verifyPaymentPOST userController: ", error);

    res.redirect('/error-page');

  }

}

const savePaymentDataPOST = async (req,res)=>{

  try{

    const paymentGatewayResponse = req.body;
  
    if(req.body.razorpay_signature){
  
      const orderId = req.body.razorpay_order_id;
  
      const dbPaymentHistoryCollectionId = await userHelpers.getPaymentHistoryId(orderId);
  
      userHelpers.updatePaymentHistory(dbPaymentHistoryCollectionId, paymentGatewayResponse).then(()=>{
  
        res.json({status:true});
  
      });
  
    }else{
  
      const failedPaymentData = req.body;
  
      const orderId = failedPaymentData['error[metadata][order_id]'];
  
      const dbPaymentHistoryCollectionId = await userHelpers.getPaymentHistoryId(orderId);
  
      userHelpers.updatePaymentHistory(dbPaymentHistoryCollectionId, paymentGatewayResponse).then(()=>{
  
        res.json({status:true});
  
      })
  
    }

  }catch(error){

    console.log("Error from savePaymentDataPOST userController: ", error);

    res.redirect('/error-page');

  }

}


/* ========================ORDER CANCELLATION Controllers======================== */

const orderCancellationRequestPOST = async (req,res)=>{

  try{

    const orderId = req.body.orderId;

    await userHelpers.requestOrderCancellation(orderId).then((response)=>{
  
      res.redirect('/orders');
  
    }).catch((error) => {
  
      console.log("Error from requestOrderCancellation userHelper at orderCancellationRequestPOST userController: " , error);
  
    });

  }catch(error){

    console.log("Error from orderCancellationRequestPOST userController: ", error);

    res.redirect('/error-page');

  }

}


/* ========================ORDER RETURN Controllers======================== */

const orderReturnRequestPOST = async (req,res)=>{

  try{

    const orderId = req.body.orderId;

    await userHelpers.requestOrderReturn(orderId).then((response)=>{
  
      res.redirect('/orders');
  
    }).catch((error) => {
  
      console.log("Error from requestOrderReturn userHelper at orderReturnRequestPOST controller: " , error);
  
    });

  }catch(error){

    console.log("Error from orderReturnRequestPOST userController: ", error);

    res.redirect('/error-page');

  }

}









/* ======================== Error Handling Controllers======================== */

const accessForbiddenPageGET = (req,res)=>{

  try{

    const user = req.session.userSession;

    if(user){
  
      res.render('user/error-access-forbidden',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Access Forbidden", user});
  
    }else{
  
      res.render('user/error-access-forbidden',{ layout: 'user-layout', title:PLATFORM_NAME + " || Access Forbidden"});
  
    }

  }catch(error){

    console.log("Error from accessForbiddenPageGET userController: ", error);

    res.redirect('/error-page');

  }
  
}


const errorHandlerPageGET = (req,res)=>{

  try{

    const user = req.session.userSession;

    if(user){
  
      res.render('user/error-page',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Error Page", user});
  
    }else{
  
      res.render('user/error-page',{ layout: 'user-layout', title:PLATFORM_NAME + " || Error Page"});
  
    }

  }catch(error){

    console.log("Error from errorHandlerPageGET userController: ", error);

    const errorMessage = " Something went wrong!!!, It's a 500 - Server Error "
    const instructionForUser = " Hi there, just grab a cup of coffee for now & visit the website after sometime, we'll fix it for you by then. "

    // If ERROR HANDLING PAGE REQUEST FAILED, Send a response to client indicating server error
    res.status(500).json({ Server_Error : errorMessage, Required_Action : instructionForUser});

  }

}






module.exports = {

  homePageGET,
  userLogInGET,
  userLogInPOST,
  userLogOutPOST,
  userSignUpGET,
  userSignUpPOST,
  reSendUserSignUpOTPGET,
  requestToReSendUserSignUpOTPPOST,
  verifyUserSignUpGET,
  verifyUserSignUpPOST,
  forgotPasswordGET,
  verifyAccountForPasswordResetPOST,
  verifyOTPForPasswordResetGET,
  verifyOTPForPasswordResetPOST,
  resetUserPasswordPOST,
  categoryWiseProductsGET,
  userProfileGET,
  userProfileUpdateRequestPOST,
  userWishlistGET,
  modifyUserWishlistPOST,
  manageUserAddressGET,
  addNewAddressPOST,
  changePrimaryAddressPOST,
  editUserAddressPOST,
  deleteUserAddressPOST,
  singleProductPageGET,
  cartGET,
  emptyCartGET,
  addToCartGET,
  changeCartProductQuantityPOST,
  deleteCartProductPOST,
  userOrdersGET,
  userOrderDetailsPOST,
  placeOrderGET,
  placeOrderPOST,
  orderSuccessGET,
  orderFailedGET,
  verifyPaymentPOST,
  savePaymentDataPOST,
  orderCancellationRequestPOST,
  orderReturnRequestPOST,
  accessForbiddenPageGET,
  errorHandlerPageGET

}