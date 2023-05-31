const db = require("../config/connection");
const collections = require('../config/collections')
const bcrypt = require('bcrypt');
const ObjectId = require("mongodb").ObjectId;
const paymentGateway = require('../config/connection')

require('dotenv').config(); // Module to Load environment variables from .env file


/*==============================Payment Gateway Configuration========== */

var razorpayInstance = paymentGateway.razorpayInstance; 
// Creating an new instance of the Razorpay using the instance(object of Razorpay) that was created and exported from connection.js


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

                    if(err){

                        console.log(err);

                        reject(err);
                        
                    }
                    
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

                    if(err){

                        console.log(err);

                        reject(err);
                        
                    }
                    
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

                        if(err){

                            console.log(err);
    
                            reject(err);
                            
                        }
                        
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

                        if(err){

                            console.log(err);
    
                            reject(err);
                            
                        }
                        
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

                    if(err){

                        console.log(err);

                        reject(err);
                        
                    }

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
    
                        if(err){

                            console.log(err);
    
                            reject(err);
                            
                        }
    
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
    
                        if(err){

                            console.log(err);
    
                            reject(err);
                            
                        }
    
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
    
                    if(err){

                        console.log(err);

                        reject(err);
                        
                    }
    
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

        let orderStatus = orderData['payment-method'] === 'COD' ? 'Order Placed' : 'Payment Pending'

        let orderDetails = {

            userId:ObjectId(user._id),

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

            db.get().collection(collections.ORDERS_COLLECTION).insertOne(orderDetails).then((dbOrderDetails)=>{

                let dbOrderId = dbOrderDetails.insertedId.toString(); 
                // To return back the inserted Id of the order which is returned from Db to use in payment gateway order creation.

                // console.log(dbOrderId);

                db.get().collection(collections.CART_COLLECTION).deleteOne({user:ObjectId(user._id)}).then((deleteResult)=>{

                    // console.log(deleteResult);

                    resolve(dbOrderId); // Returning back the order Id in orders collection of DB to use in payment gateway order creation

                })


            }).catch((err)=>{
    
                if(err){

                    console.log(err);

                }

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

    },
    getProductsInOrder:(orderId)=>{

        return new Promise( async (resolve,reject)=>{

            let productDetails = await db.get().collection(collections.ORDERS_COLLECTION).aggregate([
                
                {

                    $match:{_id:ObjectId(orderId)}

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

            ]).toArray();

            // console.log(productDetails);

            resolve(productDetails);
 
        });

    },
    getOrderDate:(orderId)=>{

        // console.log(userId);

        return new Promise( async (resolve,reject)=>{

            let orderDetails = await db.get().collection(collections.ORDERS_COLLECTION).find({_id:ObjectId(orderId)}).toArray();

            // console.log(orderDetails[0].date);

            resolve(orderDetails[0].date);

        })

    },
    generateRazorpayOrder:(orderId,orderValue)=>{

        orderValue = orderValue * 100; 
        // To convert paisa into rupees as the Razorpay takes the amount in smallest currency unit (paisa) 
        // Amount is in currency subunits. Default currency is INR. Hence, 1 refers to 1 paise, so here the amount is multiplied by 100 to convert it to rupees

        return new Promise((resolve,reject)=>{

            let orderDetails = {

                amount: orderValue,
                currency: "INR",
                receipt: orderId

            };

            // console.log(orderDetails);

            razorpayInstance.orders.create(orderDetails, function(err, orderDetails) {

                if(err) {

                    console.log('Order Creation Error from Razorpay: ' + err);

                }else{

                    // console.log("New order created by Razorpay: " + orderDetails);

                    resolve(orderDetails);

                }

            });

        })

    },
    verifyOnlinePayment:(paymentData)=>{

        // console.log(paymentData);

        return new Promise((resolve,reject)=>{

            const crypto = require('crypto'); // Requiring crypto Module here for generating server signature for payments verification

            let razorpaySecretKey = process.env.RAZORPAY_SECRET_KEY;

            let hmac = crypto.createHmac('sha256', razorpaySecretKey); // Hashing Razorpay secret key using SHA-256 Algorithm
        
            hmac.update(paymentData['razorpayServerPaymentResponse[razorpay_order_id]'] + '|' + paymentData['razorpayServerPaymentResponse[razorpay_payment_id]']); 
            // Updating the hash (re-hashing) by adding Razprpay payment Id and order Id received from client as response
        
            let serverGeneratedSignature = hmac.digest('hex');
            // Converted the final hashed result into hexa code and saving it as server generated signature

            let razorpayServerGeneratedSignatureFromClient = paymentData['razorpayServerPaymentResponse[razorpay_signature]']
        
            if(serverGeneratedSignature === razorpayServerGeneratedSignatureFromClient){ 
                // Checking that is the signature generated in our server using the secret key we obtained by hashing secretkey,orderId & paymentId is same as the signature sent by the server 

                // console.log("Payment Signature Verified");

                resolve()
        
            }else{
        
                // console.log("Payment Signature Verification Failed");

                reject()
        
            }

        })

    },
    updateOnlineOrderPaymentStatus:(ordersCollectionId, onlinePaymentStatus)=>{

        // console.log("updateOnlineOrderPaymentStatus Function Called");

        return new Promise((resolve,reject)=>{

            if(onlinePaymentStatus){

                db.get().collection(collections.ORDERS_COLLECTION)
                  .updateOne(

                    { _id: ObjectId(ordersCollectionId) },

                    { $set: { orderStatus: "Order Placed" } }

                  ).then(() => {

                    resolve();

                  }

                );

            }else{

                db.get().collection(collections.ORDERS_COLLECTION)
                  .updateOne(

                    { _id: ObjectId(ordersCollectionId) },

                    { $set: { orderStatus: "Order Failed" } }

                ).then(() => {
                    
                    resolve() 
                    
                });

            }

        });

    }

}
