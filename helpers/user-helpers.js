const db = require("../config/connection");
const collections = require('../config/collections')
const bcrypt = require('bcrypt');
const ObjectId = require("mongodb").ObjectId;

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

                        console.log("Incorrect user password");

                        resolve({status:false});

                    }
                })

            }else{

                console.log("User dosent exist");

                resolve({status:false});

            }

        })

    },
    addToCart:(productId, userId)=>{

        return new Promise(async (resolve,reject)=>{

            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)});

            // console.log(userCart);

            if(userCart){

                db.get().collection(collections.CART_COLLECTION)
                .updateOne({ user: ObjectId(userId) },

                    {

                        $push: { products: ObjectId(productId) }

                    }
                )
                .then(() => {

                    resolve();

                })

            }else{

                let cartObject = {
                    
                    user: ObjectId(userId),

                    products: [ObjectId(productId)]

                }  

                db.get().collection(collections.CART_COLLECTION)
                .insertOne(cartObject)
                .then(()=>{

                    resolve();

                })

            }

        })
    },
    getCartProducts:(userId)=>{

        return new Promise(async (resolve,reject)=>{

            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                
                {
                    $match:{user:ObjectId(userId)}
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        let: { productList: "$products" },
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id','$$productList']
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }

            ]).toArray()

            resolve(cartItems[0].cartItems);
 
        })

    }

}
