/*======================================= ADMIN CONTROLLERS =======================================*/

const productHelpers = require('../../helpers/product-helpers');
const adminHelpers = require('../../helpers/admin-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"


/* ============================================= LOGIN & LOGOUT CONTROLLERS ============================================= */

const logInGET = (req,res)=>{

  if(req.session.adminSession){

    res.redirect('/admin');

  }else{

    res.render('admin/admin-login',{ layout: 'admin-layout', "loginError":req.session.adminLogginErr, title:PLATFORM_NAME + " || Admin Login", PLATFORM_NAME, admin:true});

    req.session.adminLogginErr = false; 
    /*
    Resetting the flag for checking if the login page post request was due to invalid username or password.
    This is done so that the login page will show the message only once if there was a redirect to this page due to invalid credentials.
    */
    
  }
  
}
  
const logInPOST = (req,res)=>{
  
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
  
}
  
const logOutPOST = (req,res)=>{
  
  req.session.adminSession = false;

  req.session.adminLoggedIn = false;

  res.redirect('/admin');
  
}


// ====================Controller for Admin Dashboard====================

const adminDashboardGET =  (req, res)=>{
  
  let adminData = req.session.adminSession;

  res.render('admin/admin-home',{ layout: 'admin-layout', title: PLATFORM_NAME + " || Admin Panel", PLATFORM_NAME, admin:true, adminData, PLATFORM_NAME });
  
};


// ====================Controller for Adding New Admin====================

const addNewAdminGET = (req, res)=>{

  const adminData = req.session.adminSession;

  res.render('admin/add-admin',{ layout: 'admin-layout', title:PLATFORM_NAME + " || Add Admin", PLATFORM_NAME, admin:true, adminData});
  
};
  
const addNewAdminPOST =  (req, res)=>{
  
  adminHelpers.addNewAdmin(req.body).then((result)=>{
    
    res.redirect('/admin/add-admin');
    
  })
  
};


// ====================Controller for Managing Users====================

const manageUsersGET = async (req,res)=>{

  let adminData = req.session.adminSession;

  adminHelpers.getAllUsers().then((platformUserData)=>{

    res.render('admin/manage-users', { layout: 'admin-layout', title: PLATFORM_NAME + " || Manage Users", PLATFORM_NAME, admin:true, adminData, platformUserData});

  })
  
};

// ====================Controller for Blocking & Unblocking Users====================

const changeUserStatusPOST = async (req,res)=>{
  
  let userId = req.body.userId;

  adminHelpers.changeUserBlockStatus(userId).then(()=>{

    res.redirect('/admin/manage-users');

  })
  
};


// ====================Controller for Managing Orders====================

const manageOrdersGET = async (req,res)=>{

  let adminData = req.session.adminSession;

  await adminHelpers.getAllOrders().then((platformOrderData)=>{

    res.render('admin/admin-order-summary', { layout: 'admin-layout', title: PLATFORM_NAME + " || Manage Orders", PLATFORM_NAME, admin:true, adminData, platformOrderData});

  })
  
};

const singleOrderDetailsPOST = async (req,res)=>{

  let adminData = req.session.adminSession;

  let orderId = req.body.orderId;

  let orderDetails = await adminHelpers.getSingleOrderData(orderId);

  let productDetails = await adminHelpers.getSingleOrderDataForOrdersDisplay(orderId);

  res.render('admin/admin-single-order-summary', { layout: 'admin-layout', title: PLATFORM_NAME + " || Order details", PLATFORM_NAME, admin:true, adminData, orderDetails, productDetails});
  
};


// ====================Controllers for Updating Order STATUS====================

const changeOrderStatusPOST = async (req,res)=>{

  let adminData = req.session.adminSession;

  let orderId = req.body.orderId;

  let orderStatus = req.body.status;

  await adminHelpers.updateOrderStatus(orderId, orderStatus).then((response)=>{

    res.send({status:true});

  })
  
};



// ====================Controllers for Managing Order CANCELLATION====================

const orderCancellationPOST = async (req,res)=>{

  let adminData = req.session.adminSession;

  let orderId = req.body.orderId;

  let orderDetails = await adminHelpers.getSingleOrderData(orderId);

  let productDetails = await adminHelpers.getSingleOrderDataForOrdersDisplay(orderId);

  res.render('admin/admin-side-order-cancellation-request', { layout: 'admin-layout', title: PLATFORM_NAME + " || Order details", PLATFORM_NAME, admin:true, adminData, orderDetails, productDetails});
  
};

const approveOrderCancellationPOST = async (req,res)=>{

  let adminData = req.session.adminSession;

  let orderId = req.body.orderId;

  await adminHelpers.manageOrderCancellation(orderId,true, false).then((response)=>{

    if(response.refundAvailable){

      adminHelpers.addRefundToWalletBalance(orderId, true, false).then((response)=>{

        res.redirect('/admin/order-summary');

      })

    }else{

      res.redirect('/admin/order-summary');

    }

  })
  
};

const rejectOrderCancellationPOST = async (req,res)=>{

  let adminData = req.session.adminSession;

  let orderId = req.body.orderId;

  await adminHelpers.manageOrderCancellation(orderId,false, false).then((response)=>{

    res.redirect('/admin/order-summary');

  })
  
};

const adminSideOrderCancellationPOST = async (req,res)=>{

  let adminData = req.session.adminSession;

  let orderId = req.body.orderId;

  await adminHelpers.manageOrderCancellation(orderId, true, true).then((response)=>{

    if(response.refundAvailable){

      adminHelpers.addRefundToWalletBalance(orderId, true, false).then((response)=>{

        res.redirect('/admin/order-summary');

      })

    }else{

      res.redirect('/admin/order-summary');

    }

  })
  
};


// ====================Controllers for Managing Order RETURN ====================

const reviewOrderReturnRequestPOST = async (req,res)=>{

  let adminData = req.session.adminSession;

  let orderId = req.body.orderId;

  let orderDetails = await adminHelpers.getSingleOrderData(orderId);

  let productDetails = await adminHelpers.getSingleOrderDataForOrdersDisplay(orderId);

  res.render('admin/admin-side-order-cancellation-request', { layout: 'admin-layout', title: PLATFORM_NAME + " || Order details", PLATFORM_NAME, admin:true, adminData, orderDetails, productDetails});
  
};

const changeOrderReturnStatusPOST = async (req,res)=>{

  let adminData = req.session.adminSession;

  let orderId = req.body.orderId;

  let adminResponse = req.body.status;

  if(adminResponse === "Approve Return"){

    adminResponse = true;

  }else if (adminResponse === "Reject Return"){

    adminResponse = false;

  }

  await adminHelpers.manageOrderReturn(orderId,adminResponse).then((response)=>{

    if(response.refundAvailable){

      adminHelpers.addRefundToWalletBalance(orderId, false, true).then((response)=>{

        res.redirect('/admin/order-summary');

      })

    }else{

      res.redirect('/admin/order-summary');

    }

  })
  
};









/* ======================== Error Handling Controllers======================== */

const adminAccessForbiddenPageGET = (req,res)=>{

  const adminData = req.session.adminSession;

  if(adminData){

    res.render('admin/error-access-forbidden',{ layout: 'admin-layout', title: adminData.name +"'s " + PLATFORM_NAME + " || Access Forbidden", PLATFORM_NAME, adminData});

  }else{

    res.render('admin/error-access-forbidden',{ layout: 'admin-layout', title:PLATFORM_NAME + " || Access Forbidden", PLATFORM_NAME});

  }
  
}


const adminErrorHandlerPageGET = (req,res)=>{

  const adminData = req.session.adminSession;

  if(adminData){

    res.render('admin/error-page',{ layout: 'admin-layout', title: adminData.name +"'s " + PLATFORM_NAME + " || Error Page", PLATFORM_NAME,  adminData});

  }else{

    res.render('admin/error-page',{ layout: 'admin-layout', title:PLATFORM_NAME + " || Error Page", PLATFORM_NAME});

  }
  
}










module.exports = {

  logInGET,
  logInPOST,
  logOutPOST,
  adminDashboardGET,
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