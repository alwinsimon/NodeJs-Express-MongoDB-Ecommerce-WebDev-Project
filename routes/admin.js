var express = require('express');
var router = express.Router();

// ====================Route to Admin Dashboard====================
router.get('/', function(req, res, next) {

  let products = [

    {
      _id:1,
      name:"I Phone 11",
      category:"mobile",
      description:"Coolest Phone",
      image:"https://images.unsplash.com/photo-1512054502232-10a0a035d672?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80"
    },
    {
      _id:2,
      name:"MacBook Pro",
      category:"laptop",
      description:"Coolest Laptop Ever",
      image:"https://images.unsplash.com/photo-1512054502232-10a0a035d672?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80"
    },
    {
      _id:3,
      name:"Google Pixel",
      category:"mobile",
      description:"Best Android Phone Ever",
      image:"https://images.unsplash.com/photo-1512054502232-10a0a035d672?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80"
    },
    {
      _id:4,
      name:"Hp Laserjet",
      category:"printer",
      description:"Fastest Printer on the planet",
      image:"https://images.unsplash.com/photo-1512054502232-10a0a035d672?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80"
    }

  ]

  res.render('admin/view-products',{title:"Admin Panel",admin:true,products});
});

// ====================Route to Add NEW Product Page====================
router.get('/add-product',(req,res)=>{

  res.render('admin/add-product',{title:"Add product",admin:true})

});

router.post('/add-product',(req,res)=>{

  console.log(req.body);
  console.log(req.files.image);

});

module.exports = router;
