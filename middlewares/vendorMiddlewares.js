/*======================================= VENDOR MIDDLEWARES =======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyVendorLogin = (req,res,next)=>{

  try{

    if(req.session.vendorLoggedIn){

      next();
  
    }else{
  
      res.redirect('/vendor/login');
  
    }

  }catch(error){

    console.error("Error from verifyVendorLogin vendor-midddleware: ", error);

    const errorMessage = " Something went wrong!!!, It's a 500 - Server Error "
    const instructionForUser = " Hi there, just grab a cup of coffee for now & visit the website after sometime, we'll fix it for you by then. "

    // If Middleware FAILED, Send a response to client indicating server error
    res.status(500).json({ Server_Error : errorMessage, Required_Action : instructionForUser});

  }
  
}



module.exports = {

  verifyVendorLogin
    
}