var express = require('express');
const productHelper = require('../helpers/product-helpers');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  productHelper.getAllProducts().then((products)=>{

    res.render('index', { title: 'Shopping Cart', products, admin:false });

  })

});

module.exports = router;
