const express = require('express');
const router = express.Router();
const productHelper = require('../helpers/product-helpers');

// ====================Route to Admin Dashboard====================
router.get('/', function(req, res, next) {

  productHelper.getAllProducts().then((products)=>{
   
    res.render('admin/view-products',{title:"Admin Panel",admin:true,products});
    
  })


});

// ====================Route to Add NEW Product Page====================
router.get('/add-product',(req,res)=>{

  res.render('admin/add-product',{title:"Add product",admin:true})

});

router.post('/add-product',(req,res)=>{

  productHelper.addProduct(req.body,(result)=>{

    let id = result.insertedId

    let image = req.files.image;

    image.mv('./public/product-images/' + id +'.jpg',(err,done)=>{

      if(err){

        console.log(err);

      }else{

        res.render('admin/add-product',{title:"Add product",admin:true});

      }

    });

  });

});


// ====================Route to DELETE a PRODUCT====================

router.get('/delete-product/:id',(req,res)=>{

  let productId = req.params.id;

  let productImageId = productId

  productHelper.deleteProduct(productId,productImageId).then((response)=>{
    // console.log(response);
  })

  res.redirect('/admin');

})












module.exports = router;
