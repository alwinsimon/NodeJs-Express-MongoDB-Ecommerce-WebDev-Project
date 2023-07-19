/*======================================= ADMIN CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');
const userHelpers = require('../../helpers/user-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"


/* ============================================= LOGIN & LOGOUT CONTROLLERS ============================================= */

const logInGET = (req,res)=>{

  try{

    if(req.session.adminSession){

      res.redirect('/admin');
  
    }else{
  
      res.render('admin/admin-login-page',{ layout: 'admin-login-layout', "loginError":req.session.adminLogginErr, title:PLATFORM_NAME + " || Admin Login", PLATFORM_NAME });
  
      delete req.session.adminLogginErr; 
      /*
      Deleting the flag for checking if the login page post request was due to invalid username or password.
      This is done so that the login page will show the message only once if there was a redirect to this page due to invalid credentials.
      */
      
    }

  }catch(error){

    console.log("Error from logInGET adminController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const logInPOST = (req,res)=>{

  try{

    if(req.session.adminLoggedIn){

      res.redirect('/admin');
  
    }else{
  
      adminHelpers.doAdminLogin(req.body).then((doAdminLoginResponse)=>{
  
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

  }catch(error){

    console.log("Error from logInPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

}
  
const logOutPOST = (req,res)=>{

  try{

    req.session.adminSession = false;

    req.session.adminLoggedIn = false;
  
    res.redirect('/admin');


  }catch(error){

    console.log("Error from logOutPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

}


// ====================Controller for Adding New Admin====================

const addNewAdminGET = (req, res)=>{

  try{

    const adminData = req.session.adminSession;

    res.render('admin/add-admin',{ layout: 'admin-layout', title:PLATFORM_NAME + " || Add Admin", PLATFORM_NAME, admin:true, adminData});

  }catch(error){

    console.log("Error from addNewAdminGET adminController: ", error);

    res.redirect('/admin/error-page');

  }
  
};
  
const addNewAdminPOST =  (req, res)=>{

  try{

    adminHelpers.addNewAdmin(req.body).then((result)=>{
    
      res.redirect('/admin/add-admin');
      
    })

  }catch(error){

    console.log("Error from addNewAdminPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};


// ====================Controller for Managing Users====================

const manageUsersGET = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    adminHelpers.getAllUsers().then((platformUserData)=>{
  
      res.render('admin/manage-users', { layout: 'admin-layout', title: PLATFORM_NAME + " || Manage Users", PLATFORM_NAME, admin:true, adminData, platformUserData});
  
    })

  }catch(error){

    console.log("Error from manageUsersGET adminController: ", error);

    res.redirect('/admin/error-page');

  }

};

// ====================Controller for Blocking & Unblocking Users====================

const changeUserStatusPOST = async (req,res)=>{

  try{

    const userId = req.body.userId;

    adminHelpers.changeUserBlockStatus(userId).then(()=>{
  
      res.redirect('/admin/manage-users');
  
    })

  }catch(error){

    console.log("Error from changeUserStatusPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};


// ====================Controller for Managing Orders====================

const manageOrdersGET = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    await adminHelpers.getAllOrders().then((platformOrderData)=>{
  
      res.render('admin/admin-order-summary', { layout: 'admin-layout', title: PLATFORM_NAME + " || Manage Orders", PLATFORM_NAME, admin:true, adminData, platformOrderData});
  
    })

  }catch(error){

    console.log("Error from manageOrdersGET adminController: ", error);

    res.redirect('/admin/error-page');

  }

};

const singleOrderDetailsPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const orderId = req.body.orderId;
  
    const orderDetails = await adminHelpers.getSingleOrderData(orderId);
  
    const productDetails = await adminHelpers.getSingleOrderDataForOrdersDisplay(orderId);

    const orderData = await userHelpers.getDetailedOrderData(orderId); // For passing order data to the page
  
    res.render('admin/admin-single-order-summary', { layout: 'admin-layout', title: PLATFORM_NAME + " || Order details", PLATFORM_NAME, admin:true, adminData, orderDetails, productDetails, orderData});


  }catch(error){

    console.log("Error from singleOrderDetailsPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};


// ====================Controllers for Updating Order STATUS====================

const changeOrderStatusPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const orderId = req.body.orderId;
  
    const orderStatus = req.body.status;
  
    await adminHelpers.updateOrderStatus(orderId, orderStatus).then((response)=>{
  
      res.send({status:true});
  
    })

  }catch(error){

    console.log("Error from changeOrderStatusPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};



// ====================Controllers for Managing Order CANCELLATION====================

const orderCancellationPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const orderId = req.body.orderId;
  
    const orderDetails = await adminHelpers.getSingleOrderData(orderId);
  
    const productDetails = await adminHelpers.getSingleOrderDataForOrdersDisplay(orderId);
  
    res.render('admin/admin-side-order-cancellation-request', { layout: 'admin-layout', title: PLATFORM_NAME + " || Order details", PLATFORM_NAME, admin:true, adminData, orderDetails, productDetails});

  }catch(error){

    console.log("Error from orderCancellationPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};

const approveOrderCancellationPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const orderId = req.body.orderId;

    await adminHelpers.manageOrderCancellation(orderId,true, false).then( async (response)=>{
  
      if(response.refundAvailable){
  
        const refundProcess = await adminHelpers.addRefundToWalletBalance(orderId, true, false);
  
      }

      // ============================== Update Inventory ==============================
      const inventoryUpdateStatus = await adminHelpers.updateInventoryForOrderCancellationAndReturn(orderId);

      if(inventoryUpdateStatus.status){

        res.redirect('/admin/order-summary');

      }else{

        console.error("Error-1 from updateInventoryForOrderCancellationAndReturn admin-helper at approveOrderCancellationPOST adminController: ", inventoryUpdateStatus);

        res.redirect('/admin/error-page');

      }
  
    })

  }catch(error){

    console.log("Error from approveOrderCancellationPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};

const rejectOrderCancellationPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const orderId = req.body.orderId;
  
    await adminHelpers.manageOrderCancellation(orderId,false, false).then((response)=>{
  
      res.redirect('/admin/order-summary');
  
    })

  }catch(error){

    console.log("Error from rejectOrderCancellationPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};

const adminSideOrderCancellationPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const orderId = req.body.orderId;
  
    await adminHelpers.manageOrderCancellation(orderId, true, true).then( async (response)=>{
  
      if(response.refundAvailable){
  
        const refundProcess = adminHelpers.addRefundToWalletBalance(orderId, true, false);
  
      }

      // ============================== Update Inventory ==============================
      const inventoryUpdateStatus = await adminHelpers.updateInventoryForOrderCancellationAndReturn(orderId);

      if(inventoryUpdateStatus.status){

        res.redirect('/admin/order-summary');

      }else{

        console.error("Error-1 from updateInventoryForOrderCancellation admin-helper at adminSideOrderCancellationPOST adminController: ", inventoryUpdateStatus);

        res.redirect('/admin/error-page');

      }
  
    })

  }catch(error){

    console.log("Error from adminSideOrderCancellationPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};


// ====================Controllers for Managing Order RETURN ====================

const reviewOrderReturnRequestPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const orderId = req.body.orderId;
  
    const orderDetails = await adminHelpers.getSingleOrderData(orderId);
  
    const productDetails = await adminHelpers.getSingleOrderDataForOrdersDisplay(orderId);
  
    res.render('admin/admin-side-order-cancellation-request', { layout: 'admin-layout', title: PLATFORM_NAME + " || Order details", PLATFORM_NAME, admin:true, adminData, orderDetails, productDetails});

  }catch(error){

    console.log("Error from reviewOrderReturnRequestPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};

const changeOrderReturnStatusPOST = async (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    const orderId = req.body.orderId;
  
    let adminResponse = req.body.status;
  
    if(adminResponse === "Approve Return"){
  
      adminResponse = true;
  
    }else if (adminResponse === "Reject Return"){
  
      adminResponse = false;
  
    }
  
    const processOrderReturn = await adminHelpers.manageOrderReturn(orderId,adminResponse);

    if(adminResponse){
      
      // Processing refund to wallet and inventory updation , if the admin has approved order return.
  
      // ============================== Process Wallet Refund  ==============================
      const processWalletRefund = await adminHelpers.addRefundToWalletBalance(orderId, false, true);

      // ============================== Update Inventory ==============================
      const inventoryUpdateStatus = await adminHelpers.updateInventoryForOrderCancellationAndReturn(orderId);

    }

    res.redirect('/admin/order-summary');

  }catch(error){

    console.log("Error from changeOrderReturnStatusPOST adminController: ", error);

    res.redirect('/admin/error-page');

  }

};









/* ======================== Error Handling Controllers======================== */

const adminAccessForbiddenPageGET = (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    if(adminData){
  
      res.render('admin/error-access-forbidden',{ layout: 'admin-layout', title: adminData.name +"'s " + PLATFORM_NAME + " || Access Forbidden", PLATFORM_NAME, adminData});
  
    }else{
  
      res.render('admin/error-access-forbidden',{ layout: 'admin-layout', title:PLATFORM_NAME + " || Access Forbidden", PLATFORM_NAME});
  
    }

  }catch(error){

    console.log("Error from adminAccessForbiddenPageGET adminController: ", error);

    res.redirect('/admin/error-page');

  }

}


const adminErrorHandlerPageGET = (req,res)=>{

  try{

    const adminData = req.session.adminSession;

    if(adminData){
  
      res.render('admin/error-page',{ layout: 'admin-layout', title: adminData.name +"'s " + PLATFORM_NAME + " || Error Page", PLATFORM_NAME,  adminData});
  
    }else{
  
      res.render('admin/error-page',{ layout: 'admin-layout', title:PLATFORM_NAME + " || Error Page", PLATFORM_NAME});
  
    }

  }catch(error){

    console.log("Error from adminErrorHandlerPageGET adminController: ", error);

    const errorMessage = " Something went wrong!!!." + " It's a 500 - Server Error at " + PLATFORM_NAME + " server."
    const instructionForUser = " Please inform your tech team about this ASAP !!! "

    // If ADMIN ERROR HANDLING PAGE REQUEST FAILED, Send a response to client indicating server error
    res.status(500).json({ Server_Error : errorMessage, Required_Action : instructionForUser});

  }

}










module.exports = {

  logInGET,
  logInPOST,
  logOutPOST,
  addNewAdminGET,
  addNewAdminPOST,
  manageUsersGET,
  changeUserStatusPOST,
  manageOrdersGET,
  singleOrderDetailsPOST,
  orderCancellationPOST,
  approveOrderCancellationPOST,
  rejectOrderCancellationPOST,
  changeOrderStatusPOST,
  adminSideOrderCancellationPOST,
  reviewOrderReturnRequestPOST,
  changeOrderReturnStatusPOST,
  adminErrorHandlerPageGET,
  adminAccessForbiddenPageGET

}