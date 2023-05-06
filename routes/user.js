var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */
router.get('/', function(req, res, next) {

  productHelper.getAllProducts().then((products)=>{

    res.render('user/view-products', { title: 'Shopping Cart', products, admin:false });

  })

});

router.get('/login', (req,res)=>{

  res.render('user/login');

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
