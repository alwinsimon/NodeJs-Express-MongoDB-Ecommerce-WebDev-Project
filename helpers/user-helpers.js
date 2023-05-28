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

                    // console.log(user);

                    resolve(user);

                }).catch((err)=>{

                    console.log(err);

                    reject(err);
                    
                });

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

                }).catch((err)=>{

                    console.log(err);

                    reject(err);
                    
                });

            }else{

                console.log("User dosent exist");

                resolve({status:false});

            }

        })

    },
    addToCart:(productId, userId)=>{

        // Creating a object to store the product and the product quantity inside the cart
        let productObject = {

            item:ObjectId(productId),

            quantity: 1

        }

        return new Promise(async (resolve,reject)=>{

            // Checking if there is a Cart Existing for this user (using user id) in the cart collection
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)});

            // console.log(userCart);

            if(userCart){ // If there is a CART PRESENT for user, update the existing cart of the user

                /*
                # Check if the productId provided already exist in any of the productObjects inside the products array of the user cart.
                */
                let productExist = userCart.products.findIndex(product => product.item == productId);
                /*
                # productExist will have the value of -1 if there is no product existing in the products array of user cart
                # if product exists already, productExist will have the value of the index in which the product exists in the products array of user cart
                */

                if(productExist !== -1){ // If the value of productExists is NOT EQUAL TO -1, which means there is the same product existing in products array inside user cart already.

                    // Since the same product exists already, UPDATE (INCREMENT) the value of quantity inside the productObject

                    db.get().collection(collections.CART_COLLECTION)
                    .updateOne(

                        {user:ObjectId(userId),'products.item':ObjectId(productId)}, // Matching the same product in the products array of cart collection of the user

                        {$inc:{'products.$.quantity':1}}

                    ).then(()=>{

                        resolve();

                    }).catch((err)=>{

                        console.log(err);
    
                        reject(err);
                        
                    });

                    // console.log('CART EXISTS for user == Same Product exist for user == Quantity Modified');

                }else{ // User have a cart in cart collection, but DON'T have the given product existing in the products array of user cart already.

                    // Add the new product object to the products array of the usercart
                    db.get().collection(collections.CART_COLLECTION)
                    .updateOne(

                        {user:ObjectId(userId)},

                        {$push:{products:productObject}}

                    ).then(()=>{

                        resolve();

                    }).catch((err)=>{

                        console.log(err);
    
                        reject(err);
                        
                    });

                    // console.log('CART EXISTS for user == Same Product DOSENT exist in cart == Product added to producs array');

                }

            }else{ // If there is NO EXISTING CART for the user, create new cart and insert the product to the cart

                let cartObject = {
                    
                    user: ObjectId(userId),

                    products: [productObject]

                }  

                db.get().collection(collections.CART_COLLECTION)
                .insertOne(cartObject)
                .then((data)=>{

                    // console.log(data);

                    resolve()

                }).catch((err)=>{

                    console.log(err);

                    reject(err);

                });

                // console.log('New CART Created for user & New product added to cart:');

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

                    $unwind:'$products'

                },
                {

                    $project:{

                        item:'$products.item',

                        quantity:'$products.quantity'

                    }

                },
                {

                    $lookup:{

                        from:collections.PRODUCT_COLLECTION,

                        localField:'item',

                        foreignField:'_id',

                        as:'product'

                    }

                },
                {

                    $project:{

                        item:1,

                        quantity:1,

                        product:{$arrayElemAt:['$product',0]}

                    }

                }

            ]).toArray()

            // console.log(cartItems);

            resolve(cartItems);
 
        })

    },
    getCartCount:(userId)=>{

        return new Promise(async(resolve,reject)=>{
            
            let count = 0;

            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)});

            if(cart){

                count = cart.products.length;

            }

            resolve(count);

        })    
    },
    changeCartProductQuantity:(cartData)=>{

        // console.log(cartData);

        // Convert the count received to integer to using in incrementing or decrementing product quantity in DB
        cartData.count = parseInt(cartData.count);

        // Convert the quantity received to integer to using in incrementing or decrementing product quantity in CART PAGE
        cartData.quantity = parseInt(cartData.quantity);

        return new Promise((resolve,reject)=>{

            if(cartData.quantity == 1 && cartData.count == -1){
                // If the existing product quantity id 1 and decrement button clicked by user, remove the product from user cart

                db.get().collection(collections.CART_COLLECTION)
                .updateOne(
                    {

                      _id: ObjectId(cartData.cart),
                    
                    },
                    {
                    
                        $pull: { products:{item:ObjectId(cartData.product)} }, // Remove the product from user Cart
                    
                    }
                    ).then((data)=>{
    
                        // console.log(data);
    
                        resolve({cartProductRemoved:true});
                        // Send a status to Ajax call as boolean inside aobject, for indicating the product removal 
    
                    }).catch((err)=>{
    
                        console.log(err);
    
                        reject(err);
    
                    }
                );

            }else{ // Increment or decrement the product quantity in cart according to count

                db.get().collection(collections.CART_COLLECTION)
                .updateOne(
                    {
                      _id: ObjectId(cartData.cart),
                      "products.item": ObjectId(cartData.product),
                    },
    
                    {
                      $inc: { "products.$.quantity": cartData.count },
                    }
                    ).then((data)=>{
    
                        // console.log(data);
    
                        resolve({status:true});
    
                    }).catch((err)=>{
    
                        console.log(err);
    
                        reject(err);
    
                    }
                );

            }

        })

    },
    deleteProductFromCart:(productDetails)=>{

        return new Promise((resolve,reject)=>{

            db.get().collection(collections.CART_COLLECTION)
            .updateOne(
                {
    
                  _id: ObjectId(productDetails.cart),
                
                },
                {
                
                    $pull: { products:{item:ObjectId(productDetails.product)} }, // Remove the product from user Cart
                
                }
                ).then((data)=>{
    
                    // console.log(data);
    
                    resolve({cartProductRemoved:true});
                    // Send a status to Ajax call as boolean inside aobject, for indicating the product removal 
    
                }).catch((err)=>{
    
                    console.log(err);
    
                    reject(err);
    
                }
            );

        })

    },
    getCartValue:(userId)=>{
        
        return new Promise( async(resolve,reject)=>{

            let totalCartValue = await db.get().collection(collections.CART_COLLECTION).aggregate([
                
                {

                    $match:{user:ObjectId(userId)}

                },
                {

                    $unwind:'$products'

                },
                {

                    $project:{

                        item:'$products.item',

                        quantity:'$products.quantity'

                    }

                },
                {

                    $lookup:{

                        from:collections.PRODUCT_COLLECTION,

                        localField:'item',

                        foreignField:'_id',

                        as:'product'

                    }

                },
                {

                    $project:{

                        item:1,

                        quantity:1,

                        product:{$arrayElemAt:['$product',0]}

                    }

                },
                {
                  $project: {
                    item: 1,
                    quantity: 1,
                    product: {
                      $mergeObjects: [
                        '$product',
                        { price: { $toInt: '$product.price' } }
                      ]
                    }
                  }
                },
                {
                    
                    $group:{

                        _id:null,

                        cartValue:{$sum:{$multiply:['$quantity', '$product.price']}} 

                    }

                }

            ]).toArray();

            // console.log(totalCartValue[0]);

            resolve(totalCartValue[0].cartValue);

        });

    },
    getProductListForOrders:(userId)=>{

        return new Promise( async(resolve,reject)=>{

            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)});

            if(cart){ // Send cart products if cart exist for user in db cart collection

                resolve(cart.products);

            }else{ // Send a status false (boolean), if cart dosen't exist for user in db cart collection

                resolve(false);

            }

        })

    },
    placeOrder:(user,orderData,orderedProducts,totalOrderValue)=>{

        // console.log(orderData);

        let orderStatus = orderData['payment-method'] === 'COD' ? 'placed' : 'payment-pending'

        let orderDetails = {

            userId:user._id,

            userName:user.name,

            date: new Date(),
        
            orderValue:totalOrderValue,

            paymentMethod:orderData['payment-method'],

            orderStatus:orderStatus,

            products:orderedProducts,

            deliveryDetails:{

                name:orderData.name,

                address:orderData.address,

                pincode:orderData.pin,

                mobile:orderData.mobile,

                email:orderData.email

            }            
        
        }

        // console.log(orderDetails);

        return new Promise((resolve,reject)=>{

            db.get().collection(collections.ORDERS_COLLECTION).insertOne(orderDetails).then((response)=>{

                // console.log(response);

                db.get().collection(collections.CART_COLLECTION).deleteOne({user:ObjectId(user._id)}).then((response)=>{

                    // console.log(response);

                    resolve();

                })

            }).catch((err)=>{
    
                console.log(err);

                reject(err);

            });
        });
    },
    getUserOrderHistory:(userId)=>{

        // console.log(userId);

        return new Promise( async (resolve,reject)=>{

            let orderHistory = await db.get().collection(collections.ORDERS_COLLECTION).find({userId:ObjectId(userId)}).toArray();

            // console.log(orderHistory);

            resolve(orderHistory);

        })

    }

}
