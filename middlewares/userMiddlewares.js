
const userHelpers = require('../helpers/user-helpers');


/*======================================= USER MIDDLEWARES =======================================*/

// Function to use as Middleware to verify if the request are made by a user or guest
const verifyUserLogin = async (req,res,next)=>{

  try{

    if(req.session.userLoggedIn){
  
      /* 
      Updating the user session everytime (when a loggedIn user makes any kind of request) with the data from DB so that if the user was blocked by Admin,
      The userSession data will be updated with data from DB with the change in blocked Status in the very next time user makes a request if he's loggedIn already. 
      This prevents user to do any action if he was blocked by admin even when he was having a active session.
      */
      await userHelpers.getUserData(req.session.userSession._id).then((currentUserData)=>{
        
        req.session.userSession = currentUserData;
    
      });
    
      if(req.session.userSession.blocked){
  
        delete req.session.userLoggedIn;
    
        delete req.session.userSession;
    
        req.session.userLogginErr = "We are extremely sorry to inform that your account has been temporarily suspended - Please contact the Site Admin for resolution";
        
        res.redirect('/login');
    
      }else{
        
        next();
    
      }
    
    }else{
    
      res.redirect('/login');
    
    }

  }catch(error){

    console.error("Error from verifyUserLogin user-midddleware: ", error);

    const errorMessage = " Something went wrong!!!, It's a 500 - Server Error "
    const instructionForUser = " Hi there, just grab a cup of coffee for now & visit the website after sometime, we'll fix it for you by then. "

    // If Middleware FAILED, Send a response to client indicating server error
    res.status(500).json({ Server_Error : errorMessage, Required_Action : instructionForUser});

  }
    
}


module.exports = {

  verifyUserLogin

}