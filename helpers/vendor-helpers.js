const db = require("../config/externalConnectionsConfig");
const collections = require('../config/databaseCollectionsConfig');
const bcrypt = require('bcrypt');
const ObjectId = require("mongodb").ObjectId;
const paymentGateway = require("../config/externalConnectionsConfig");

require('dotenv').config(); // Module to Load environment variables from .env file





module.exports = {

    doVendorSignup : (vendorSignupFormData)=>{

        return new Promise(async (resolve,reject)=>{

            try{

                vendorSignupFormData.password = await bcrypt.hash(vendorSignupFormData.password,10);

                vendorSignupFormData.joinedOn = new Date();
    
                vendorSignupFormData.blocked = false;
    
                const vendorCollection = db.get().collection(collections.VENDOR_COLLECTION);
    
                vendorCollection.insertOne(vendorSignupFormData).then((insertResult)=>{
    
                    const insertedId = insertResult.insertedId;
    
                    vendorCollection.findOne({_id: insertedId}).then((vendorData)=>{
    
                        resolve(vendorData);
    
                    }).catch((error)=>{
    
                        console.error("Error-1 from DB query at vendor-helpers: ", error);

                        reject(error);
                        
                    });
    
                })
            
            }catch(error){
            
                console.error("Error from doVendorSignup vendor-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    doVendorLogin : (loginFormData)=>{

        return new Promise( async (resolve,reject)=>{

            try{

                let vendorAuthenticationResponse = {};

                const vendor = await db.get().collection(collections.VENDOR_COLLECTION).findOne({email:loginFormData.email});
    
                if(vendor){
    
                    bcrypt.compare(loginFormData.password, vendor.password).then((verificationData)=>{
    
                        if(verificationData){
    
                            vendorAuthenticationResponse.status = true;
    
                            vendorAuthenticationResponse.vendorData = vendor;
    
                            resolve(vendorAuthenticationResponse);
    
                        }else{
    
                            vendorAuthenticationResponse.status = false;
    
                            vendorAuthenticationResponse.passwordError = true;
    
                            resolve(vendorAuthenticationResponse);
    
                        }
    
                    })
    
                }else{
    
                    vendorAuthenticationResponse.status = false;
    
                    vendorAuthenticationResponse.emailError = true;
    
                    resolve(vendorAuthenticationResponse);
    
                }
            
            }catch(error){
            
                console.error("Error from doVendorLogin vendor-helpers: ", error);
            
                reject(error);
            
            }

        })

    }

}