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


// ====================Routes to EDIT a PRODUCT====================

router.get('/edit-product/:id',(req,res)=>{

  let productID = req.params.id;

  let product = productHelper.getProductDetails(productID).then((productDetails)=>{

    // console.log(productDetails);

    res.render('admin/edit-product',{title:"Edit product", admin:true, productDetails});

  })

})

router.post('/edit-product/:id',(req,res)=>{

  let productId = req.params.id;

  productHelper.updateProduct(productId,req.body).then(()=>{

    /*
    Redirect the user to admin page first, if there is any new image uploaded, update that in server after redirecting user.
    This will prevent user from keeping the user waiting in the edit page itself till the image gets uploaded.
    */
    res.redirect('/admin')

    // Fuction to update the image if new image is uploaded in the edit page
    if(req.files){

      let id = req.params.id;

      let image = req.files.image

      image.mv('./public/product-images/' + id +'.jpg',(err,done)=>{

        if(err){
  
          console.log(err);
  
        }
  
      });

    }

  })

})











module.exports = router;
