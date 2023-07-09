/*======================================= ADMIN MIDDLEWARES =======================================*/


// Function to use as Middleware to verify if the request are made by a logged-In admin
const verifyAdminLogin = (req,res,next)=>{

  try{

    if(req.session.adminLoggedIn){

      next();
  
    }else{
  
      res.redirect('/admin/login')
  
    }

  }catch(error){

    console.error("Error from verifyAdminLogin admin-midddleware: ", error);

    const errorMessage = " Something went wrong!!!." + " It's a 500 - Server Error at " + PLATFORM_NAME + " server."
    const instructionForUser = " Please inform your tech team about this ASAP !!! "

    // If Middleware FAILED, Send a response to client indicating server error
    res.status(500).json({ Server_Error : errorMessage, Required_Action : instructionForUser});

  }
  
}



module.exports = {

  verifyAdminLogin
    
}