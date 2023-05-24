var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');



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

let PLATFORM_NAME = "GetMyDeal"

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

  let cartItems = await userHelpers.getCartProducts(req.session.user._id);

  // console.log(cartItems);

  res.render('user/cart',{ title: user.name + "'s " + PLATFORM_NAME + " || Cart" , admin:false, user, cartItems, cartCount })

})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{

  console.log("api call");

  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{

    res.json({status:true});

  })

})



module.exports = router;
