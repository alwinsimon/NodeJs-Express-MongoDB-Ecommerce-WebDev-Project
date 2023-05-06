var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */
router.get('/', function(req, res, next) {

  let user = req.session.user //used for authenticating a user visit if user has already logged in earlier

  productHelpers.getAllProducts().then((products)=>{

    res.render('user/view-products', { title: 'Shopping Cart', products, admin:false, user });

  })

});

router.get('/login', (req,res)=>{

  res.render('user/login');

})

router.post('/login',(req,res)=>{

  userHelpers.doLogin(req.body).then((response)=>{

    if(response.status){

      req.session.loggedIn = true;

      req.session.user = response.user

      res.redirect('/');

    }else{

      res.redirect('/login');

    }

  })

})

router.get('/logout',(req,res)=>{

  req.session.destroy();

  res.redirect('/')

})

router.get('/signup', (req,res)=>{

  res.render('user/signup');

})

router.post('/signup',(req,res)=>{

  userHelpers.doSignup(req.body).then((user)=>{
    
    console.log(user);

  })

})

module.exports = router;
