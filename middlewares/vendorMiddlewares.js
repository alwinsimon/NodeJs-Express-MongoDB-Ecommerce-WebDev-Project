/*======================================= VENDOR MIDDLEWARES =======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyVendorLogin = (req,res,next)=>{

    if(req.session.vendorLoggedIn){
  
      next();
  
    }else{
  
      res.redirect('/vendor/login');
  
    }
  
}



module.exports = {

    verifyVendorLogin
    
}