const db = require("../config/connection");
const collections = require('../config/collections')
const bcrypt = require('bcrypt');
const ObjectId = require("mongodb").ObjectId;
const paymentGateway = require('../config/connection');

require('dotenv').config(); // Module to Load environment variables from .env file





module.exports = {

    doAdminLogin:(loginFormData)=>{

        let adminAuthenticationResponse = {};

        return new Promise( async (resolve,reject)=>{

            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({email:loginFormData.email});

            if(admin){

                bcrypt.compare(loginFormData.password, admin.password).then((verificationData)=>{

                    if(verificationData){

                        adminAuthenticationResponse.status = true;

                        adminAuthenticationResponse.adminData = admin;

                        resolve(adminAuthenticationResponse);

                    }else{

                        adminAuthenticationResponse.status = false;

                        adminAuthenticationResponse.passwordError = true;

                        resolve(adminAuthenticationResponse);

                    }

                })

            }else{

                adminAuthenticationResponse.status = false;

                adminAuthenticationResponse.emailError = true;

                resolve(adminAuthenticationResponse);

            }

        })

    },
    addNewAdmin:(newAdminDetails)=>{

        return new Promise( async (resolve,reject)=>{

            newAdminDetails.password = await bcrypt.hash(newAdminDetails.password, 10);

            db.get().collection(collections.ADMIN_COLLECTION).insertOne(newAdminDetails).then((result)=>{

                resolve(result._insertedId);

            })

        });

    }

}