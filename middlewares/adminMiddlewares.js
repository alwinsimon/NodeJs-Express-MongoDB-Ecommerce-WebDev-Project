/*======================================= ADMIN MIDDLEWARES =======================================*/


// Function to use as Middleware to verify if the request are made by a logged-In admin
const verifyAdminLogin = (req,res,next)=>{

    if(req.session.adminLoggedIn){
  
      next();
  
    }else{
  
      res.redirect('/admin/login')
  
    }
  
}



module.exports = {

    verifyAdminLogin
    
}