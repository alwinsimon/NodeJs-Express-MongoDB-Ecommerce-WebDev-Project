/*======================================= USER CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const userHelpers = require('../../helpers/user-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const couponHelpers = require('../../helpers/coupon-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"


/* ========================HOME Page Controller======================== */

const homePageGET = async (req, res, next)=>{

  try{

    let user = req.session.userSession //used for authenticating a user visit if user has already logged in earlier

    let productCategories = await adminHelpers.getProductCategories();

    let cartCount = 0;

    let wishlistCount = 0;

    if(user){

      cartCount = await userHelpers.getCartCount(req.session.userSession._id);

      wishlistCount = await userHelpers.getWishlistCount(user._id);

    }

    productHelpers.getAllProducts().then((products)=>{

      if(user){

        res.render('user/user-home', { layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME, admin:false, user, products, productCategories, cartCount, wishlistCount });

      }else{

        res.render('user/user-home', { layout: 'user-layout', title:PLATFORM_NAME, admin:false, products, productCategories });

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

    if(req.session.userSignupData){

      res.render('user/sign-in-otp-validation',{ layout: 'user-layout', title:PLATFORM_NAME + " || Verify Sign-Up OTP", user:true});
  
    }else{
  
      res.redirect('/signup');
  
    }

  }catch(error){

    console.log("Error from verifyUserSignUpGET userController: ", error);

    res.redirect('/error-page');

  }
  
}
  
const verifyUserSignUpPOST = (req,res)=>{

  try{

    let otpFromUser = req.body.otp;

    let userSignUpRequestData = req.session.userSignupData;

    let userPhoneNumber = userSignUpRequestData.phone;

    userHelpers.verifyUserSignUpOtp(otpFromUser, userPhoneNumber).then((verificationData)=>{

      if(verificationData.verified){

        userHelpers.doUserSignup(userSignUpRequestData).then((userData)=>{
      
          // console.log(user);
      
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

    const formData = {

      name : req.body.name,

      lastName : req.body.lastName,

      age : req.body.age,

      phoneNumberAlternative : req.body.phoneNumberAlternative,

      userTagline : req.body.userTagline

    }
    
    userHelpers.updateUserData(userId, formData).then((response)=>{

      if(response.success){

        res.redirect("/profile/" + userId);

      }else{

        res.redirect("/error-page");

      }

    }).catch((err)=>{

      console.log("Error from updateUserData userHelper at userProfileUpdateRequestPOST controller : ", err);
      
    });

  }catch(error){

    console.log("Error from userProfileUpdateRequestPOST userController: ", error);

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

    const userId = req.session.userSession._id;

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

/* ========================Single Product Page Controller======================== */

const singleProductPageGET =  (req, res) => {

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

  }).catch((err) => {

    console.log("Error from user/product-details route: " , err);

    res.redirect('/error-page'); // Redirect to an error page if there was an error

  });
    
}


/* ========================CART Controllers======================== */

const cartGET = async (req,res)=>{

  let user = req.session.userSession //To pass user name to cart-page while rendering - used to display Custom title for page.

  let cartCount = null;

  if(user){

    cartCount = await userHelpers.getCartCount(req.session.userSession._id);

  }

  if(cartCount > 0){  // If there is atleast 1 item in the database, then calculate fetch items and value from db
    
    let cartItems = await userHelpers.getCartProducts(req.session.userSession._id);

    const wishlistCount = await userHelpers.getWishlistCount(user._id);

    let cartValue = await userHelpers.getCartValue(user._id);

    // console.log(cartItems);
    // console.log(cartValue);

    res.render('user/cart',{ layout: 'user-layout', title: user.name + "'s " + PLATFORM_NAME + " || Cart" , admin:false, user, cartItems, cartCount, cartValue, wishlistCount });

  }else{ // If there is no items in the cart - then redirect to a different page to avoid the query to database for cartitems and cartvalue

    res.redirect('/empty-cart');

  }
  
}
  
const emptyCartGET = async (req,res)=>{
  
  let user = req.session.userSession //To pass user name to the page while rendering - used to display Custom title for page.

  if(user){

    cartCount = await userHelpers.getCartCount(req.session.userSession._id);

    const wishlistCount = await userHelpers.getWishlistCount(user._id);

    res.render('user/empty-cart',{ layout: 'user-layout', title: user.name + "'s " + PLATFORM_NAME + " || Empty Cart" , admin:false, user, cartCount, wishlistCount });

  }else{

    res.render('user/empty-cart',{ layout: 'user-layout', title: user.name + "'s " + PLATFORM_NAME + " || Empty Cart" , admin:false, wishlistCount });

  }
  
}
  
const addToCartGET = (req,res)=>{
  
  // console.log("api call");

  userHelpers.addToCart(req.params.id,req.session.userSession._id).then(()=>{

    res.json({status:true});

  })
  
}
  
const changeCartProductQuantityPOST = (req,res,next)=>{
  
  // console.log(req.body);

  userHelpers.changeCartProductQuantity(req.body).then( async (response)=>{

    response.cartValue =  await userHelpers.getCartValue(req.body.userId); // Adding a cartValue feild to response object 

    // console.log(response.cartValue);

    res.json(response); 
    /* 
    # Used JSON to send data back here as RESPONSE to AJAX Call from cart page
    # As we are using AJAX there is no need of sending back a complete web page or redirecting to a webpage (which will load the page completely)
    # We can configure the AJAX to use the data in JSON format for updating the specific element of webpage
    */
  
  }).catch((err)=>{

    console.log(err);

    reject(err);
    
  });
  
}
  
const deleteCartProductPOST = (req,res,next)=>{
  
  // console.log(req.body);

  userHelpers.deleteProductFromCart(req.body).then((response)=>{

    res.json(response); 
    /* 
    # Used JSON to send data back here as RESPONSE to AJAX Call from cart page
    # As we are using AJAX there is no need of sending back a complete web page or redirecting to a webpage (which will load the page completely)
    # We can configure the AJAX to use the data in JSON format for updating the specific element of webpage
    */
  
  }).catch((err)=>{

    console.log(err);

    reject(err);
    
  });
  
}


/* ========================ORDERS & PAYMENTS Controllers======================== */

const userOrdersGET = async (req,res)=>{

  const user = req.session.userSession // Used for storing user details for further use in this route

  const orderDetails = await userHelpers.getUserOrderHistory(user._id);

  const wishlistCount = await userHelpers.getWishlistCount(user._id);

  // console.log(orderDetails);

  res.render('user/orders',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Orders" , admin:false, user, orderDetails, wishlistCount});
  
}
  
const userOrderDetailsPOST = async (req,res)=>{
  
  let user = req.session.userSession // Used for storing user details for further use in this route

  // console.log(req.body);

  let orderId = req.body.orderId;

  let productDetails = await userHelpers.getProductsInOrder(orderId);

  let orderDate = await userHelpers.getOrderDate(orderId); // For passing order date to the page

  // console.log(orderDate);

  res.render('user/ordered-product-details',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Ordered Product Details" , admin:false, user, productDetails, orderDate});
  
}

const placeOrderGET = async (req,res)=>{
  
  let user = req.session.userSession // Used for storing user details for further use in this route

  // console.log(user._id);

  cartCount = await userHelpers.getCartCount(req.session.userSession._id);

  if(cartCount > 0){

    let cartProducts = await userHelpers.getCartProducts(user._id);

    let cartValue = await userHelpers.getCartValue(user._id);

    const userAddress = await userHelpers.getUserAddress(user._id);

    const wishlistCount = await userHelpers.getWishlistCount(user._id);

    const primaryAddress = await userHelpers.getUserPrimaryAddress(user._id);

    // Coupon Request configuration
    let couponError = false;
    let couponApplied = false;

    if(req.session.couponInvalidError){

      couponError = req.session.couponInvalidError;

    }else if(req.session.couponApplied){

      couponApplied = req.session.couponApplied;

    }

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


    if(primaryAddress){

      res.render('user/place-order',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Order Summary" , admin:false, user, cartProducts, cartValue, userAddress, primaryAddress, wishlistCount, couponApplied, couponError, couponDiscount });

      delete req.session.couponApplied;

      delete req.session.couponInvalidError;

    }else{

      res.render('user/place-order',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Order Summary" , admin:false, user, cartProducts, cartValue, userAddress, wishlistCount, couponApplied, couponError, couponDiscount });

      delete req.session.couponApplied;

      delete req.session.couponInvalidError;

    }

  }else{

    res.redirect('/empty-cart');
  }
  
}
  
const placeOrderPOST = async (req,res)=>{
  
  let user = req.session.userSession // Used for storing user details for further use in this route

  let orderDetails = req.body;

  let orderedProducts = await userHelpers.getProductListForOrders(user._id);
  // This variable will store the product details if cart exist for user, else will store a boolean value false returned by the function

  if(orderedProducts){ // If there are products inside user cart , Proceed executing checkout functions

    let totalOrderValue = await userHelpers.getCartValue(user._id);

    const availableCouponData = await couponHelpers.checkCurrentCouponValidityStatus(user._id, totalOrderValue);

    if(availableCouponData.status){

      const couponDiscountAmount = availableCouponData.couponDiscount;

      // Inserting the value of coupon discount into the order details object created above
      orderDetails.couponDiscount = couponDiscountAmount;

      // Updating the total order value with coupon discount applied
      totalOrderValue = totalOrderValue - couponDiscountAmount;

      const updateCouponUsedStatusResult = await couponHelpers.updateCouponUsedStatus(user._id, availableCouponData.couponId);

    }

    userHelpers.placeOrder(user,orderDetails,orderedProducts,totalOrderValue).then((orderId)=>{

      if(req.body['payment-method']==='COD'){

        res.json({COD_CHECKOUT:true});
  
      }else if(req.body['payment-method']==='ONLINE'){
  
        userHelpers.generateRazorpayOrder(orderId,totalOrderValue).then((razorpayOrderDetails)=>{

          // console.log(razorpayOrderDetails);

          userHelpers.createPaymentHistory(user,orderId,orderDetails,totalOrderValue,razorpayOrderDetails);
          // Creating a new document in payment history collection in the Database with all the available data of the placed order

          let razorpayKeyId = process.env.RAZORPAY_KEY_ID

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
    
}
  
const orderSuccessGET = (req,res)=>{
  
  let user = req.session.userSession // Used for storing user details for further use in this route

  res.render('user/order-success',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Order Placed!!!" , admin:false, user});
  
}
  
const orderFailedGET = (req,res)=>{
  
  let user = req.session.userSession // Used for storing user details for further use in this route

  res.render('user/order-failed',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Sorry, Order failed" , admin:false, user});
  
}
  
const verifyPaymentPOST = (req,res)=>{
  
  // console.log(req.body);

  // The below verifyOnlinePayment function will match the signature returned by Razorpay with our server generated signature
  userHelpers.verifyOnlinePayment(req.body).then(()=>{

    // The below function updateOnlineOrderPaymentStatus will be called upon succesful verification of payment by verifyOnlinePayment above
    // updateOnlineOrderPaymentStatus function will update the payment status in DB

    let receiptId = req.body['serverOrderDetails[receipt]'];

    let paymentSuccess = true;

    userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(()=>{

      // Sending the receiptId to the above userHelper to modify the order status in the DB
      // We have set the Receipt Id is same as the orders cart collection ID

      res.json({status:true});

      // console.log('Payment Succesful from Update online Orders');

    })
    

  }).catch((err)=>{

    if(err){
      
      console.log(err);

      let paymentSuccess = false;

      userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(()=>{

        // Sending the receiptId to the above userHelper to modify the order status in the DB
        // We have set the Receipt Id is same as the orders cart collection ID

        res.json({status:false});

        // console.log('Payment Failed from Update online Orders');

      })
    
    }

  });
  
}

const savePaymentDataPOST = async (req,res)=>{
  
  let paymentGatewayResponse = req.body;

  // console.log(paymentGatewayResponse);

  if(req.body.razorpay_signature){

    let orderId = req.body.razorpay_order_id;

    let dbPaymentHistoryCollectionId = await userHelpers.getPaymentHistoryId(orderId);

    // console.log(dbPaymentHistoryCollectionId);

    userHelpers.updatePaymentHistory(dbPaymentHistoryCollectionId, paymentGatewayResponse).then(()=>{

      res.json({status:true});

    });

  }else{

    let failedPaymentData = req.body;

    let orderId = failedPaymentData['error[metadata][order_id]'];

    let dbPaymentHistoryCollectionId = await userHelpers.getPaymentHistoryId(orderId);

    // console.log(dbPaymentHistoryCollectionId);

    userHelpers.updatePaymentHistory(dbPaymentHistoryCollectionId, paymentGatewayResponse).then(()=>{

      res.json({status:true});

    })

  }
  
}


/* ========================ORDER CANCELLATION Controllers======================== */

const orderCancellationRequestPOST = async (req,res)=>{

  let orderId = req.body.orderId;

  await userHelpers.requestOrderCancellation(orderId).then((response)=>{

    res.redirect('/orders');

  }).catch((err) => {

    console.log("Error from orderCancellationRequestPOST controller: " , err);

    res.redirect('/error-page'); // Redirect to an error page if there was an error

  });

}


/* ========================ORDER RETURN Controllers======================== */

const orderReturnRequestPOST = async (req,res)=>{

  let orderId = req.body.orderId;

  await userHelpers.requestOrderReturn(orderId).then((response)=>{

    res.redirect('/orders');

  }).catch((err) => {

    console.log("Error from orderReturnRequestPOST controller: " , err);

    res.redirect('/error-page'); // Redirect to an error page if there was an error

  });

}









/* ======================== Error Handling Controllers======================== */

const accessForbiddenPageGET = (req,res)=>{

  const user = req.session.userSession;

  if(user){

    res.render('user/error-access-forbidden',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Access Forbidden", user});

  }else{

    res.render('user/error-access-forbidden',{ layout: 'user-layout', title:PLATFORM_NAME + " || Access Forbidden"});

  }
  
}


const errorHandlerPageGET = (req,res)=>{

  const user = req.session.userSession;

  if(user){

    res.render('user/error-page',{ layout: 'user-layout', title: user.name +"'s " + PLATFORM_NAME + " || Error Page", user});

  }else{

    res.render('user/error-page',{ layout: 'user-layout', title:PLATFORM_NAME + " || Error Page"});

  }
  
}






module.exports = {

  homePageGET,
  userLogInGET,
  userLogInPOST,
  userLogOutPOST,
  userSignUpGET,
  userSignUpPOST,
  verifyUserSignUpGET,
  verifyUserSignUpPOST,
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