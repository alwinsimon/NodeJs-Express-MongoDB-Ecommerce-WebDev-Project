var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file



/*=======================================MIDDLEWARES=======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyLogin = (req,res,next)=>{

  if(req.session.loggedIn){

    next();

  }else{

    res.redirect('/login')

  }

}

/*=======================================USER ROUTES=======================================*/

let PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"

/* ========================HOME page======================== */

router.get('/', async (req, res, next)=>{

  let user = req.session.user //used for authenticating a user visit if user has already logged in earlier

  let cartCount = null;

  if(user){

    cartCount = await userHelpers.getCartCount(req.session.user._id);

  }

  productHelpers.getAllProducts().then((products)=>{

    if(user){

      res.render('user/view-products', { title: user.name +"'s " + PLATFORM_NAME, products, admin:false, user, cartCount });

    }else{

      res.render('user/view-products', { title:PLATFORM_NAME, products, admin:false, user });

    }

  })

});

/* ========================LOGIN/SIGN-UP ROUTES======================== */

router.get('/login', (req,res)=>{

  if(req.session.loggedIn){

    res.redirect('/');

  }else{

    res.render('user/login',{"loginError":req.session.logginErr, title:PLATFORM_NAME + " || Login", admin:false});

    req.session.logginErr = false; 
    /*
    Resetting the flag for checking if the login page post request was due to invalid username or password.
    This is done so that the login page will show the message only once if there was a redirect to this page due to invalid credentials.
    */
    
  }

})

router.post('/login',(req,res)=>{

  userHelpers.doLogin(req.body).then((response)=>{

    if(response.status){

      req.session.loggedIn = true;

      req.session.user = response.user

      res.redirect('/');

    }else{

      req.session.logginErr = "Invalid Username or Password!"; 
      /*Setting a flag for keeping a record of the login error which happened due to user entering invalid credentials.
       This flag will be checked in every login request so that we can display an error message in the case of reloading the login page due to invalid credentials entered by user.
       This flag variable is stored in the session using req.session so that it will be accesible everywhere.
       the name of this flag variable can be anything ie, this is NOT an predefined name in the session module.
      */

      res.redirect('/login');

    }

  })

})

router.get('/logout',(req,res)=>{

  req.session.destroy();

  res.redirect('/')

})

router.get('/signup', (req,res)=>{

  res.render('user/signup',{title:PLATFORM_NAME + " || Sign-up", admin:false});

})

router.post('/signup',(req,res)=>{

  userHelpers.doSignup(req.body).then((user)=>{
    
    // console.log(user);

    req.session.loggedIn = true;

    req.session.user = user;

    res.redirect('/');

  })

})

/* ========================CART ROUTES======================== */

router.get('/cart', verifyLogin, async (req,res)=>{

  let user = req.session.user //To pass user name to cart-page while rendering - used to display Custom title for page.

  let cartCount = null;

  if(user){

    cartCount = await userHelpers.getCartCount(req.session.user._id);

  }

  if(cartCount > 0){  // If there is atleast 1 item in the database, then calculate fetch items and value from db
    
    let cartItems = await userHelpers.getCartProducts(req.session.user._id);

    let cartValue = await userHelpers.getCartValue(user._id);

    // console.log(cartItems);
    // console.log(cartValue);

    res.render('user/cart',{ title: user.name + "'s " + PLATFORM_NAME + " || Cart" , admin:false, user, cartItems, cartCount, cartValue });

  }else{ // If there is no items in the cart - then redirect to a different page to avoid the query to database for cartitems and cartvalue

    res.redirect('/empty-cart');

  }

})

router.get('/empty-cart',verifyLogin, async (req,res)=>{

  let user = req.session.user //To pass user name to the page while rendering - used to display Custom title for page.

  if(user){

    cartCount = await userHelpers.getCartCount(req.session.user._id);

    res.render('user/empty-cart',{ title: user.name + "'s " + PLATFORM_NAME + " || Empty Cart" , admin:false, user, cartCount });

  }else{

    res.render('user/empty-cart',{ title: user.name + "'s " + PLATFORM_NAME + " || Empty Cart" , admin:false });

  }

})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{

  // console.log("api call");

  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{

    res.json({status:true});

  })

})

router.post('/change-product-quantity',verifyLogin, (req,res,next)=>{

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

})

router.post('/delete-product-from-cart',verifyLogin, (req,res,next)=>{

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

})

/* ========================ORDER ROUTES======================== */

router.get('/place-order',verifyLogin, async (req,res)=>{

  let user = req.session.user // Used for storing user details for further use in this route

  // console.log(user._id);

  let cartProducts = await userHelpers.getCartProducts(user._id);

  let cartValue = await userHelpers.getCartValue(user._id);

  // console.log(cartProducts);

  // console.log(cartValue);

  res.render('user/place-order',{ title: user.name +"'s " + PLATFORM_NAME + " || Order Summary" , admin:false, user, cartProducts, cartValue});

})

router.post('/place-order',verifyLogin, async (req,res)=>{

  let user = req.session.user // Used for storing user details for further use in this route

  let orderDetails = req.body;
  // console.log(req.body);

  let orderedProducts = await userHelpers.getProductListForOrders(user._id);
  // This variable will store the product details if cart exist for user, else will store a boolean value false returned by the function

  if(orderedProducts){ // If there are products inside user cart , Proceed executing checkout functions

    let totalOrderValue = await userHelpers.getCartValue(user._id);

    userHelpers.placeOrder(user,orderDetails,orderedProducts,totalOrderValue);

    res.json({checkoutStatus:true});

  }else{ // If there are NO products inside user cart , Send a status back in json

    res.json({checkoutStatus:false});

  }
  
})

router.get('/order-success',verifyLogin, (req,res)=>{

  let user = req.session.user // Used for storing user details for further use in this route

  res.render('user/order-success',{ title: user.name +"'s " + PLATFORM_NAME + " || Order Placed!!!" , admin:false, user});

})

router.get('/orders',verifyLogin, async (req,res)=>{

  let user = req.session.user // Used for storing user details for further use in this route

  let orderDetails = await userHelpers.getUserOrderHistory(user._id);

  res.render('user/orders',{ title: user.name +"'s " + PLATFORM_NAME + " || Orders" , admin:false, user, orderDetails});

})



module.exports = router;
