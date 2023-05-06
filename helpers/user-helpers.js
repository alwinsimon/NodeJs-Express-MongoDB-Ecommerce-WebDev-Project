const db = require("../config/connection");
const collections = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports = {

    doSignup:(userData)=>{

        return new Promise(async (resolve,reject)=>{

            userData.password = await bcrypt.hash(userData.password,10);

            const userCollection = db.get().collection(collections.USER_COLLECTION);

            userCollection.insertOne(userData).then((insertResult)=>{

                const insertedId = insertResult.insertedId;

                userCollection.findOne({_id: insertedId}).then((user)=>{

                    resolve(user);

                })

            })

        })

    },
    doLogin:(userData)=>{

        return new Promise(async (resolve,reject)=>{

            let loginStatus = false;

            let response = {}

            let user = await db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email});

            if(user){

                bcrypt.compare(userData.password,user.password).then((status)=>{

                    if(status){

                        console.log("Login Success");

                        response.user = user //Setting the value of the response object declared above

                        response.status = true //Setting the value of the response object declared above

                        resolve(response);
                        
                    }else{

                        console.log("Incorrect password");

                        resolve({status:false});

                    }
                })

            }else{

                console.log("User dosent exist");

                resolve({status:false});

            }

        })

    }

}
