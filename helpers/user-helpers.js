const db = require("../config/externalConnectionsConfig");
const collections = require('../config/databaseCollectionsConfig');
const bcrypt = require('bcrypt');
const ObjectId = require("mongodb").ObjectId;
const paymentGateway = require("../config/externalConnectionsConfig");
const moment = require('moment-timezone'); // Module to modify the time to various time zones
const twilio = require("../config/externalConnectionsConfig");

require('dotenv').config(); // Module to Load environment variables from .env file



/*==============================Payment Gateway Configuration========== */

const razorpayInstance = paymentGateway.razorpayInstance; 
// Creating an new instance of the Razorpay using the instance(object of Razorpay) that was created and exported from connection.js


module.exports = {

    verifyDuplicateUserSignUpData : (requestData)=>{

        return new Promise( async (resolve, reject) => {

            try {

                const registrationEmail = requestData.email;

                const registrationUserName = requestData.userName;

                const emailExists = await db.get().collection(collections.USER_COLLECTION).find( { email : registrationEmail} ).toArray();

                const userNameExists = await db.get().collection(collections.USER_COLLECTION).find( { userName : registrationUserName} ).toArray();

                if( emailExists.length === 0 && userNameExists.length === 0 ){

                    // Email and Username dosen't exist in the database, so new user registration can be done.

                    resolve( {success : true} );

                }else if( emailExists.length && userNameExists.length != 0 ){

                    resolve("Email and User Name already exist");

                }else if (emailExists.length != 0) {
                    
                    // Email already exist in the database

                    resolve("Email already exist");

                }else if (userNameExists.length != 0) {
                    
                    // Username already exist in the database
                    
                    resolve("User Name already exist");
                
                }
      
            } catch (error) {

              console.error("Error from verifyDuplicateUserSignUpData user-helpers: ", error);
      
              reject(error);
      
            }
      
        });

    },
    createUserSignUpOtp : (requestData)=>{

        return new Promise( async (resolve, reject) => {

            try {

                const userPhone = '+91' + requestData.phone;

                twilio.sendOTPwithTwilio({ to: userPhone, channel: "sms" })
                .then((verificationData) => {

                    if(verificationData.status === 'pending'){

                        verificationData.statusMessageSent = true;

                        resolve(verificationData);

                    }else{

                        verificationData.statusMessageSent = false;

                        reject(verificationData);

                    }
                
                });
      
            } catch (error) {

                console.error("Error from createUserSignUpOtp user-helpers: ", error);
      
                reject(error);
      
            }
      
        });

    },
    verifyUserSignUpOtp : (otpFromUser, userPhoneNumber)=>{

        return new Promise( async (resolve, reject) => {

            try {

                userPhoneNumber = "+91" + userPhoneNumber;
      
                twilio.verifyOTPwithTwilio({ to: userPhoneNumber, code: otpFromUser })
                .then((verificationResult) => {

                    if(verificationResult.status === "approved"){

                        verificationResult.verified = true;

                        resolve(verificationResult);

                    }else{

                        verificationResult.verified = false;

                        verificationResult.otpErrorMessage = "In-correct OTP Provided, Please enter correct OTP";

                        resolve(verificationResult);

                    }
                
                });
      
            } catch (error) {

                console.error("Error from verifyUserSignUpOtp user-helpers: ", error);
      
                reject(error);
      
            }
      
        });

    },
    createVerificationOTPWithTwilio : (phoneNumberWithoutCountryCode)=>{

        return new Promise( async (resolve, reject) => {

            try {

                const phoneNumber = '+91' + phoneNumberWithoutCountryCode;

                twilio.sendOTPwithTwilio({ to: phoneNumber, channel: "sms" })
                .then((verificationData) => {

                    if(verificationData.status === 'pending'){

                        verificationData.statusMessageSent = true;

                        resolve(verificationData);

                    }else{

                        verificationData.statusMessageSent = false;

                        reject(verificationData);

                    }
                
                });
      
            } catch (error) {

                console.error("Error from createVerificationOTPWithTwilio user-helpers: ", error);
      
                reject(error);
      
            }
      
        });

    },
    verifyOTPCreatedWithTwilio : (otpToVerify, phoneNumberWithoutCountryCode)=>{

        return new Promise( async (resolve, reject) => {

            try {

                const phoneNumberForVerification = "+91" + phoneNumberWithoutCountryCode;
      
                twilio.verifyOTPwithTwilio({ to: phoneNumberForVerification, code: otpToVerify })
                .then((verificationResult) => {

                    if(verificationResult.status === "approved"){

                        verificationResult.verified = true;

                        resolve(verificationResult);

                    }else{

                        verificationResult.verified = false;

                        verificationResult.otpErrorMessage = "In-correct OTP Provided, Please enter correct OTP";

                        resolve(verificationResult);

                    }
                
                });
      
            } catch (error) {

                console.error("Error from verifyOTPCreatedWithTwilio user-helpers: ", error);
      
                reject(error);
      
            }
      
        });

    },
    resetUserPassword : (requestedUserId, passwordToUpdate)=>{

        return new Promise(async (resolve,reject)=>{

            try{

                const userId = requestedUserId;

                let newPassword = passwordToUpdate;

                newPassword = await bcrypt.hash(newPassword,10);

                const updateUserPassword = await db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{$set:{password:newPassword}});

                resolve(updateUserPassword);
            
            }catch(error){
            
                console.error("Error from resetUserPassword user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    doUserSignup:(userData)=>{

        return new Promise(async (resolve,reject)=>{

            try{

                userData.password = await bcrypt.hash(userData.password,10);

                userData.joinedOn = new Date();
    
                userData.blocked = false;
    
                const userCollection = await db.get().collection(collections.USER_COLLECTION);
    
                userCollection.insertOne(userData).then((insertResult)=>{
    
                    const insertedId = insertResult.insertedId;
    
                    // ====== Creating a wallet for user while sign-up
                    db.get().collection(collections.WALLET_COLLECTION).insertOne({userId: ObjectId(insertedId), walletBalance: 0});
    
                    userCollection.findOne({_id: insertedId}).then((userData)=>{
    
                        resolve(userData);
    
                    }).catch((error)=>{
    
                        console.error("Error-1 from Db action in doUserSignup user-helpers: ", error);

                        reject(err);
                        
                    });
    
                })
            
            }catch(error){
            
                console.error("Error from doUserSignup user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    doUserLogin : (loginFormData)=>{

        return new Promise( async (resolve,reject)=>{

            try{

                let userAuthenticationResponse = {};

                let user = await db.get().collection(collections.USER_COLLECTION).findOne({email:loginFormData.email});
    
                if(user){
    
                    if(user.blocked){
    
                        // If the user IS A Blocked user
    
                        userAuthenticationResponse.status = false;
        
                        userAuthenticationResponse.blockedUser = true;
    
                        resolve(userAuthenticationResponse);
    
                    }else{
    
                        // If the user is NOT a Blocked user
    
                        bcrypt.compare(loginFormData.password, user.password).then((verificationData)=>{
    
                            if(verificationData){
        
                                userAuthenticationResponse.status = true;
        
                                userAuthenticationResponse.userData = user;
        
                                resolve(userAuthenticationResponse);
        
                            }else{
        
                                userAuthenticationResponse.status = false;
        
                                userAuthenticationResponse.passwordError = true;
        
                                resolve(userAuthenticationResponse);
        
                            }
        
                        })
    
                    }
    
                }else{
    
                    userAuthenticationResponse.status = false;
    
                    userAuthenticationResponse.emailError = true;
    
                    resolve(userAuthenticationResponse);
    
                }

            }catch(error){
            
                console.error("Error from doUserLogin user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    findUserwithEmail : (emailToSearch)=>{
        
        return new Promise( async (resolve,reject)=>{

            try{

                const requestEmail = emailToSearch;

                const userToFind = await db.get().collection(collections.USER_COLLECTION).findOne({email : requestEmail});

                resolve(userToFind);
            
            }catch(error){
            
                console.error("Error from findUserwithEmail user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getUserData : (userId)=>{
        
        return new Promise( async (resolve,reject)=>{

            try{

                const currentUserData = await db.get().collection(collections.USER_COLLECTION).findOne({_id : ObjectId(userId)});

                resolve(currentUserData);
            
            }catch(error){
            
                console.error("Error from getUserData user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getUserDataWithUserName : (userName)=>{
        
        return new Promise( async (resolve,reject)=>{

            try{

                const currentUserData = await db.get().collection(collections.USER_COLLECTION).findOne({userName : userName});

                resolve(currentUserData);

            }catch(error){
            
                console.error("Error from getUserDataWithUserName user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    updateUserData : (userId, requestDataForUpdation)=>{
        
        return new Promise( async (resolve,reject)=>{

            try {
                
                const dataForUpdation = {

                    name : requestDataForUpdation.name,

                    lastName : requestDataForUpdation.lastName,

                    age : requestDataForUpdation.age,

                    phoneNumberAlternative : requestDataForUpdation.phoneNumberAlternative,

                    userTagline : requestDataForUpdation.userTagline

                }

                const userCollection = await db.get().collection(collections.USER_COLLECTION);

                userCollection.updateOne( 
                    
                    {_id: ObjectId(userId)},

                    {$set: dataForUpdation }
                )

                resolve({success:true});

            } catch (error) {

                console.error("Error from updateUserData user-helpers: ", error);

                reject(error);

            }

        })

    },
    insertUserAddress: (userId, addressData) => {

        return new Promise(async (resolve, reject) => {

            try{

                const userAddressCollection = await db.get().collection(collections.USER_ADDRESS_COLLECTION).findOne({ userId: ObjectId(userId) });
      
                if (userAddressCollection != null) { 
                    
                    // If there is a existing Address Collection for the user,
                    // Add new address to that existing collection.
    
                    if(userAddressCollection.address.length > 0){

                        // If there is an Existing Address inside the address collection for the user,
                        // Add new address to that existing collection as an non-primary address.
    
                        addressData._id = new ObjectId();
    
                        addressData.dateOfCreation = new Date();
    
                        addressData.primaryAddress = false;
    
                        await db.get().collection(collections.USER_ADDRESS_COLLECTION).updateOne(
    
                            { userId: userId },
    
                            {$push: {address: addressData}}
    
                        ).then((response) => {
    
                            resolve(response);
    
                        }).catch((error) => {
    
                            console.error("Error-1 from Db action at insertUserAddress user-helpers: ", error);
    
                            reject(error);
    
                        });
    
                    }else{

                        // If there is NO Existing Address inside the address collection for the user,
                        // Add new address to that existing collection as PRIMARY address.
    
                        addressData._id = new ObjectId();
    
                        addressData.dateOfCreation = new Date();
    
                        addressData.primaryAddress = true;
    
                        await db.get().collection(collections.USER_ADDRESS_COLLECTION).updateOne(
    
                            { userId: userId },
    
                            {$push: {address: addressData}}
    
                        ).then((response) => {
    
                            resolve(response);
    
                        }).catch((error) => {
    
                            console.error("Error-2 from Db action at insertUserAddress user-helpers: ", error);
    
                            reject(error);
    
                        });
    
                    }
    
                } else if( userAddressCollection == null){ 
                    
                    // If there is NO existing address collection for the user,
                    // Create a new Address collection for the user and insert the incoming new address into the collection
    
                    addressData._id = new ObjectId();
    
                    addressData.dateOfCreation = new Date();
    
                    addressData.primaryAddress = true;
    
                    const userAddress = {
    
                    userId: userId,
    
                    address: [addressData]
    
                    };
            
                    await db.get().collection(collections.USER_ADDRESS_COLLECTION).insertOne(userAddress).then((response) => {
    
                        resolve(response);
    
                    }).catch((error) => {

                        console.error("Error-3 from Db action at insertUserAddress user-helpers: ", error);
                        
                        reject(error);
    
                    });
    
                }
            
            }catch(error){
            
                console.error("Error from insertUserAddress user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    getUserAddress: (userId) => {

        return new Promise(async (resolve, reject) => {

          try {

                const userAddressCollection = await db.get().collection(collections.USER_ADDRESS_COLLECTION).find({ userId: ObjectId(userId) });
        
                if (userAddressCollection) { 
                    
                    // If there is an existing address collection for the user

                    const addresses = await userAddressCollection.toArray();

                    const addressArray = addresses.flatMap((address) => address.address);

                    resolve(addressArray);

                } else { 
                    
                    // If there is NO existing address for the user

                    resolve([]);

                }

            } catch (error) {

                console.error("Error from getUserAddress user-helpers: ", error);

                reject(error);

            }

        });

    },
    getUserPrimaryAddress: (userId) => {

        return new Promise(async (resolve, reject) => {

            try{

                const userAddressCollection = db.get().collection(collections.USER_ADDRESS_COLLECTION);

                const userAddress = await userAddressCollection.findOne({ userId: ObjectId(userId) });
          
                if (userAddress) { // If there is an existing address collection for the user
    
                  const addresses = userAddress.address;
          
                  // Find the address object with primaryAddress set to true
                  const primaryAddress = addresses.find((address) => address.primaryAddress === true);
          
                  resolve(primaryAddress);
    
                } else { 
                    
                    // If there is NO existing address for the user

                    resolve(false);
    
                }
            
            }catch(error){
            
                console.error("Error getUserPrimaryAddress user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    changePrimaryAddress : (userId, addressId) => {

        return new Promise(async (resolve, reject) => {

            try{

                const query = { userId: userId, "address.primaryAddress": true };

                const update = {$set: { "address.$.primaryAddress": false }};
        
                await db.get().collection(collections.USER_ADDRESS_COLLECTION).updateOne(query, update);
        
                const newQuery = { userId: ObjectId(userId), "address._id": ObjectId(addressId) };

                const newUpdate = { $set: { "address.$.primaryAddress": true } };
        
                await db.get().collection(collections.USER_ADDRESS_COLLECTION).updateOne(newQuery, newUpdate);
        
                resolve({status : true});
            
            }catch(error){
            
                console.error("Error from changePrimaryAddress user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    editUserAddress : (userId, dataToUpdate) => {

        return new Promise(async (resolve, reject) => {

            try{

                // Manipulating data before inserting to db to keep the data type as boolean in the db
                dataToUpdate._id = ObjectId(dataToUpdate._id);

                dataToUpdate.dateOfCreation = new Date();

                if(dataToUpdate.primaryAddress === "true"){

                    dataToUpdate.primaryAddress = true;

                }else{

                    dataToUpdate.primaryAddress = false;

                }
        
                const query = { userId: ObjectId(userId), "address._id": ObjectId(dataToUpdate._id) };

                const update = { $set: { "address.$": dataToUpdate } };
        
                await db.get().collection(collections.USER_ADDRESS_COLLECTION).updateOne(query, update);
        
                resolve({status : true});
            
            }catch(error){
            
                console.error("Error from editUserAddress user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    deleteUserAddress: (userId, addressId) => {

        return new Promise(async (resolve, reject) => {

            try{

                const addressCollection = db.get().collection(collections.USER_ADDRESS_COLLECTION);
      
                const userQuery = { userId: ObjectId(userId) };
                const userAddress = await addressCollection.findOne(userQuery);
          
                const addressIndex = userAddress.address.findIndex(

                  (address) => address._id.toString() === addressId

                );
          
                if (addressIndex !== -1) {

                  const isPrimaryAddress = userAddress.address[addressIndex].primaryAddress;
          
                  // If the address being deleted is the primary address

                  if(isPrimaryAddress){

                        // Check if there are other addresses
                        if (userAddress.address.length > 1) {

                            // Find the first non-deleted address and update it as the new primary address
                            const newPrimaryAddressIndex = userAddress.address.findIndex(

                                (address, index) => index !== addressIndex

                            );
                
                            userAddress.address[newPrimaryAddressIndex].primaryAddress = true;

                        }

                    }
          
                  // Remove the address being deleted from the address array
                  userAddress.address.splice(addressIndex, 1);
          
                  const updateQuery = { $set: { address: userAddress.address} };
          
                  await addressCollection.updateOne(userQuery, updateQuery);

                }
          
                resolve({ status: true });

            }catch(error){
            
                console.error("Error from deleteUserAddress user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    getUserWalletData : (userId)=>{
        
        return new Promise( async (resolve,reject)=>{

            try{
                    
                const userWalletData = await db.get().collection(collections.WALLET_COLLECTION).findOne({userId : ObjectId(userId)});

                resolve(userWalletData);

            } catch (error){

                console.error("Error from getUserWalletData user-helpers: ", error);

                reject(error);
            
            }

        })

    },
    addToCart : (productId, userId)=>{

        return new Promise(async (resolve,reject)=>{

            try{

                // Creating a object to store the product and the product quantity inside the cart
                let productObject = {

                    item:ObjectId(productId),

                    quantity: 1

                }

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

                        }).catch((error)=>{

                            console.error("Error-1 from Db update query at addToCart user-helpers: ", error);

                            reject(error);
                            
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

                        }).catch((error)=>{

                            console.error("Error-2 from Db update query at addToCart user-helpers: ", error);

                            reject(error);
                            
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

                        resolve()

                    }).catch((error)=>{

                        console.error("Error-3 from Db update query at addToCart user-helpers: ", error);

                        reject(error);

                    });

                    // console.log('New CART Created for user & New product added to cart:');

                }
            
            
            }catch(error){
            
                console.error("Error from addToCart user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getUserWishListData: (userId) => {

        return new Promise(async (resolve, reject) => {

            try{

                const pipeline = [

                    {$match: { userId: ObjectId(userId) }},

                    {
                        $lookup: {

                        from: collections.PRODUCT_COLLECTION,

                        localField: "products",

                        foreignField: "_id",

                        as: "products"

                        }
                    },

                    { $project: {products: 1} }

                ];
        
                const userWishListData = await db.get().collection(collections.WISH_LIST_COLLECTION).aggregate(pipeline).toArray();
        
                if (userWishListData.length > 0) {

                    resolve(userWishListData[0].products);

                } else {

                    resolve([]);

                }

            }catch(error){
            
                console.error("Error from getUserWishListData user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    addOrRemoveFromWishList:(productId, userId)=>{

        return new Promise(async (resolve,reject)=>{

            try{

                // Checking if there is a wishlist Existing for this user (using user id) in the wishlist collection
                const userWishlist = await db.get().collection(collections.WISH_LIST_COLLECTION).findOne({userId:ObjectId(userId)});

                if( userWishlist && userWishlist != null ){ 
                    
                    // If there is a WISH LIST PRESENT for user, update the existing WISH LIST of the user

                    /*
                    # Check if the productId provided already exist in products array of the user Wishlist.
                    */
                    const productExist = userWishlist.products.findIndex(products => products == productId);

                    /*
                    # productExist will have the value of -1 if there is no product existing in the products array of user wishlist
                    # if product exists already, productExist will have the value of the index in which the product exists in the products array of user cart
                    */

                    if(productExist !== -1){ 
                        
                        // If the value of productExists is NOT EQUAL TO -1, which means there is the same product existing in products array inside user wish list already.

                        // Since the same product exists already, remove it from the products array

                        db.get().collection(collections.WISH_LIST_COLLECTION)
                        .updateOne(

                            {userId:ObjectId(userId)}, // Matching the same product in the products array of cart collection of the user

                            {$pull:{products:ObjectId(productId)}}

                        ).then(()=>{

                            resolve({removed:true});

                        }).catch((error)=>{

                            console.error("Error-1 from Db update query at addOrRemoveFromWishList user-helpers: ", error);

                            reject(error);
                            
                        });

                        // console.log('WISHLIST EXISTS for user == Given Product exist for user == Product removed from wishlist');

                    }else{ 
                        
                        // User have a document in wishlist collection, but DON'T have the given product existing in the products array of wishlist document already.

                        // Add the new product object to the products array of the usercart
                        db.get().collection(collections.WISH_LIST_COLLECTION)
                        .updateOne(

                            {userId:ObjectId(userId)},

                            {$push:{products:ObjectId(productId)}}

                        ).then(()=>{

                            resolve({status:true});

                        }).catch((error)=>{

                            console.error("Error-2 from Db update query at addOrRemoveFromWishList user-helpers: ", error);

                            reject(error);
                            
                        });

                        // console.log('WISHLIST EXISTS for user == Given Product DOSENT exist in WISHLIST == Product added to products array');

                    }

                }else{ 
                    
                    // If there is NO EXISTING WISHLIST for the user, create new WISHLIST and insert the product to the WISHLIST

                    const newUserWishlist = {
                        
                        userId: ObjectId(userId),

                        products: [ObjectId(productId)]

                    }  

                    db.get().collection(collections.WISH_LIST_COLLECTION)
                    .insertOne(newUserWishlist)
                    .then((data)=>{

                        resolve({status:true})

                    }).catch((error)=>{

                        console.error("Error-3 from Db update query at addOrRemoveFromWishList user-helpers: ", error);

                        reject(error);

                    });

                    // console.log('New WISHLIST Created for user & product added to WISHLIST with Product ID:', productId );

                }
            
            }catch(error){
            
                console.error("Error from addOrRemoveFromWishList user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getWishlistCount : (userId)=>{

        return new Promise(async(resolve,reject)=>{

            try{

                let count = 0;

                const wishList = await db.get().collection(collections.WISH_LIST_COLLECTION).findOne({userId:ObjectId(userId)});
    
                if(wishList != null){
    
                    count = wishList.products.length;
    
                }
    
                resolve(count);
            
            }catch(error){
            
                console.error("Error from getWishlistCount user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getCartProducts : (userId) => {

        return new Promise(async (resolve, reject) => {

            try{

                const cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([

                    {$match: { user: ObjectId(userId) }},
    
                    {$unwind: '$products'},
    
                    {$project: {item: '$products.item', quantity: '$products.quantity'}},
                    
                    {$lookup: 
                        {
                            from: collections.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
    
                    {$project: 
                        {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
    
                    { $addFields: {productTotal: {$multiply: [ { $toInt: '$quantity' }, { $toInt: '$product.price' } ] } } }
    
                ]).toArray();
    
              resolve(cartItems);
            
            }catch(error){
            
                console.error("Error from getCartProducts user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    getCartCount : (userId)=>{

        return new Promise(async(resolve,reject)=>{

            try{

                let count = 0;

                const cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)});
    
                if( cart && cart != null ){
    
                    count = cart.products.length;
    
                }
    
                resolve(count);
            
            }catch(error){
            
                console.error("Error from getCartCount user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getOrdersCount : (userId)=>{

        return new Promise(async(resolve,reject)=>{

            try {

                let count = 0;

                const orders = await db.get().collection(collections.ORDERS_COLLECTION).find({userId:ObjectId(userId)}).toArray();

                if( orders && orders != null){

                    count = orders.length;

                }

                resolve(count);
                
            } catch (error) {

                console.error("Error from getOrdersCount user-helpers: ", error);

                reject(error);
                
            }
            
        })

    },
    changeCartProductQuantity : (cartData)=>{

        return new Promise((resolve,reject)=>{

            try{

                // Convert the count received to integer to using in incrementing or decrementing product quantity in DB
                cartData.count = parseInt(cartData.count);

                // Convert the quantity received to integer to using in incrementing or decrementing product quantity in CART PAGE
                cartData.quantity = parseInt(cartData.quantity);

                if(cartData.quantity == 1 && cartData.count == -1){

                    // If the existing product quantity id 1 and decrement button clicked by user, remove the product from user cart

                    db.get().collection(collections.CART_COLLECTION)
                    .updateOne(

                        { _id: ObjectId(cartData.cart) },
                        
                        // Remove the product from user Cart
                        { $pull: { products:{item:ObjectId(cartData.product)} } }

                    ).then((data)=>{
    
                        // Send a status to Ajax call as boolean inside aobject, for indicating the product removal
                        resolve({cartProductRemoved:true});
    
                    }).catch((error)=>{
    
                        console.error("Error-1 from Db update query at changeCartProductQuantity user-helpers: ", error);

                        reject(error);
    
                    });

                }else{ 
                    
                    // Increment or decrement the product quantity in cart according to count

                    db.get().collection(collections.CART_COLLECTION)
                    .updateOne(

                        { _id: ObjectId(cartData.cart), "products.item": ObjectId(cartData.product) },
        
                        { $inc: { "products.$.quantity": cartData.count } }

                        ).then((data)=>{
        
                            resolve({status:true});
        
                        }).catch((error)=>{
        
                            console.error("Error-2 from Db update query at changeCartProductQuantity user-helpers: ", error);

                            reject(error);
        
                        }

                    );

                }

            }catch(error){
            
                console.error("Error from changeCartProductQuantity user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    deleteProductFromCart : (productDetails)=>{

        return new Promise((resolve,reject)=>{

            try{

                db.get().collection(collections.CART_COLLECTION)
                .updateOne(

                    { _id: ObjectId(productDetails.cart) },
                    
                    // Remove the product from user Cart
                    { $pull: { products:{item:ObjectId(productDetails.product)} } }

                ).then((data)=>{
    
                    resolve({cartProductRemoved:true});
                    // Send a status to Ajax call as boolean inside aobject, for indicating the product removal
    
                }).catch((error)=>{
    
                    console.error("Error-1 from Db update query at deleteProductFromCart user-helpers: ", error);

                    reject(error);
    
                });
            
            }catch(error){
            
                console.error("Error from deleteProductFromCart user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getCartValue : (userId)=>{
        
        return new Promise( async(resolve,reject)=>{

            try{

                const totalCartValue = await db.get().collection(collections.CART_COLLECTION).aggregate([
                
                    { $match:{ user:ObjectId(userId) } },
                    
                    { $unwind:'$products'},
    
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
    
                            product: { $mergeObjects: [ '$product', { price: { $toInt: '$product.price' } } ] }
    
                        }
    
                    },
                    {
    
                        $group: { 
                        
                            _id:null, 
                            
                            cartValue:{
                                
                                $sum:{ $multiply:['$quantity', '$product.price'] }
                            
                            } 
                        }
    
                    }
    
                ]).toArray();
    
                // Check if there is any cart value, if there is any value take it, else keep the cartValue as zero
                const cartValue = totalCartValue.length > 0 ? totalCartValue[0].cartValue : 0;

                resolve(parseInt(cartValue));
            
            }catch(error){
            
                console.error("Error from getCartValue user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    getProductListForOrders : (userId)=>{

        return new Promise( async(resolve,reject)=>{

            try{

                const cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)});

                if( cart && cart != null ){ 
                    
                    // Send cart products if cart exist for user in db cart collection
    
                    resolve(cart.products);
    
                }else{ 
                    
                    // Send a status false (boolean), if cart dosen't exist for user in db cart collection
    
                    resolve(false);
    
                }
            
            }catch(error){
            
                console.error("Error from getProductListForOrders user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    updateInventoryOfOrder : (userId)=>{

        return new Promise( async(resolve,reject)=>{

            try{

                const cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)});

                if( cart && cart != null ){
                  
                    // if cart exist for user in db cart collection
                    const cartProductsWithQuantity = cart.products;

                    // Iterate over each product in the cart
                    for (const cartProduct of cartProductsWithQuantity) {

                        const productId = cartProduct.item;

                        const quantity = cartProduct.quantity;

                        // Reduce the available stock of the product in the product collection
                        await db.get().collection(collections.PRODUCT_COLLECTION).updateOne(
                            
                            { _id: ObjectId(productId) },

                            { $inc: { availableStock: - quantity } }

                        )

                    }

                  resolve({ status: true });

                }else{ 
                    
                    // Send a error message if cart dosen't exist for user in db cart collection
    
                    reject({error:"Cart Dosent Exist or No products in the cart"});
    
                }
            
            }catch(error){
            
                console.error("Error from updateInventoryOfOrder user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    placeOrder : (user,orderData,orderedProducts,totalOrderValue)=>{

        return new Promise((resolve,reject)=>{

            try{

                const orderStatus = orderData['payment-method'] === 'COD' ? 'Order Placed' : 'Payment Pending'

                const orderDetails = {
        
                    userId:ObjectId(user._id),
        
                    userName:user.name,
        
                    date: new Date(),

                    actualOrderValue : orderData.actualOrderValue,
        
                    couponDiscount : orderData.couponDiscount,

                    productOfferDiscount : orderData.productOfferDiscount,

                    categoryOfferDiscount : orderData.categoryOfferDiscount,
                
                    orderValue:totalOrderValue,
        
                    paymentMethod:orderData['payment-method'],
        
                    orderStatus:orderStatus,
        
                    products:orderedProducts,
        
                    deliveryDetails:{
        
                        addressId:ObjectId(orderData.addressId),
        
                        addressType:orderData.addressType,
        
                        addressLine1:orderData.addressLine1,
        
                        addressLine2:orderData.addressLine2,
        
                        addressStreet:orderData.addressStreet,
        
                        addressCity:orderData.addressCity,
        
                        addressState:orderData.addressState,
        
                        addressCountry:orderData.addressCountry,
        
                        addressPostalCode:orderData.addressPostalCode,
        
                        addressContactNumber:orderData.addressContactNumber
        
                    }            
                
                }
    
                db.get().collection(collections.ORDERS_COLLECTION).insertOne(orderDetails).then((dbOrderDetails)=>{
    
                    const dbOrderId = dbOrderDetails.insertedId.toString(); 
                    // To return back the inserted Id of the order which is returned from Db to use in payment gateway order creation.

                    // Returning back the order Id in orders collection of DB to use in payment gateway order creation
                    resolve(dbOrderId);
    
                }).catch((error)=>{
        
                    console.error("Error-2 from Db insert query at placeOrder user-helpers: ", error);
    
                    reject(error);
    
                });
            
            }catch(error){
            
                console.error("Error from placeOrder user-helpers: ", error);
            
                reject(error);
            
            }

        });
        
    },
    deleteUserCart : (userId)=>{

        return new Promise((resolve,reject)=>{

            try{

                db.get().collection(collections.CART_COLLECTION).deleteOne({user:ObjectId(userId)}).then((deleteResult)=>{
    
                    // Returning back the order Id in orders collection of DB to use in payment gateway order creation
                    resolve(deleteResult);

                }).catch((error)=>{
    
                    console.error("Error-1 from Db delete action at deleteUserCart user-helpers: ", error);
    
                });
            
            }catch(error){
            
                console.error("Error from deleteUserCart user-helpers: ", error);
            
                reject(error);
            
            }

        });
        
    },
    getUserOrderHistory : (userId)=>{

        return new Promise( async (resolve,reject)=>{

            try{

                let orderHistory = await db.get().collection(collections.ORDERS_COLLECTION).find({userId:ObjectId(userId)}).sort({ date: -1 }).toArray();

                orderHistory.forEach((order) => { // Code to check and verify if the order is eligible for Return

                    const currentDate = new Date();

                    const orderDate = new Date(order.date);

                    const diffInDays = Math.floor(

                      (currentDate - orderDate) / (1000 * 60 * 60 * 24)

                    );

                    order.returnEligible = diffInDays <= 10; // Value will be true if LHS is less than or equal to RHS

                });
          
                orderHistory = orderHistory.map(history => { // For Converting the time from DB to IST
    
                  const createdOnIST = moment(history.date)
                  .tz('Asia/Kolkata')
                  .format('DD-MMM-YYYY hh:mm:ss A');
          
                  return { ...history, date: createdOnIST + " IST"};
    
                });
          
                resolve(orderHistory);
            
            }catch(error){
            
                console.error("Error from getUserOrderHistory user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getProductsInOrder : (orderId)=>{

        return new Promise( async (resolve,reject)=>{

            try{

                const productDetails = await db.get().collection(collections.ORDERS_COLLECTION).aggregate([
                
                    { $match:{_id:ObjectId(orderId)} },

                    { $unwind:'$products'},

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
    
                resolve(productDetails);
            
            }catch(error){
            
                console.error("Error from getProductsInOrder user-helpers: ", error);
            
                reject(error);
            
            }
 
        });

    },
    getDetailedOrderData : (orderId)=>{

        return new Promise( async (resolve,reject)=>{

            try{

                const orderDetails = await db.get().collection(collections.ORDERS_COLLECTION).aggregate([
                
                    { $match:{_id:ObjectId(orderId)} },

                    {
    
                        $project:{

                            actualOrderValue:'$actualOrderValue',

                            couponDiscount:'$couponDiscount',

                            productOfferDiscount:'$productOfferDiscount',

                            categoryOfferDiscount:'$categoryOfferDiscount',

                            orderValue:'$orderValue',

                            paymentMethod:'$paymentMethod',

                            orderStatus:'$orderStatus',

                            deliveryDetails:'$deliveryDetails'
    
                        }
    
                    }
    
                ]).toArray();
    
                resolve(orderDetails);
            
            }catch(error){
            
                console.error("Error from getDetailedOrderData user-helpers: ", error);
            
                reject(error);
            
            }
 
        });

    },
    getOrderDate : (orderId)=>{

        return new Promise( async (resolve,reject)=>{

            try{

                const orderDetails = await db.get().collection(collections.ORDERS_COLLECTION).find({_id:ObjectId(orderId)}).toArray();

                resolve(orderDetails[0].date);
            
            }catch(error){
            
                console.error("Error from getOrderDate user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    generateRazorpayOrder : (orderId,orderValue)=>{

        return new Promise((resolve,reject)=>{

            try{

                orderValue = orderValue * 100; 
                // To convert paisa into rupees as the Razorpay takes the amount in smallest currency unit (paisa) 
                // Amount is in currency subunits. Default currency is INR. Hence, 1 refers to 1 paise, so here the amount is multiplied by 100 to convert it to rupees
    
                let orderDetails = {
    
                    amount: orderValue,
                    currency: "INR",
                    receipt: orderId
    
                };
    
                razorpayInstance.orders.create(orderDetails, function(error, orderDetails) {
    
                    if(error) {
    
                        console.error("Error-1 from order creation function of razorpay Instance at generateRazorpayOrder user-helpers: ", error);
    
                    }else{
    
                        // console.log("New order created by Razorpay: " , orderDetails);
    
                        resolve(orderDetails);
    
                    }
    
                });
            
            }catch(error){
            
                console.error("Error from generateRazorpayOrder user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    verifyOnlinePayment : (paymentData)=>{

        return new Promise((resolve,reject)=>{

            try{

                const crypto = require('crypto'); // Requiring crypto Module here for generating server signature for payments verification

                const razorpaySecretKey = process.env.RAZORPAY_SECRET_KEY;
    
                let hmac = crypto.createHmac('sha256', razorpaySecretKey); // Hashing Razorpay secret key using SHA-256 Algorithm
            
                hmac.update(paymentData['razorpayServerPaymentResponse[razorpay_order_id]'] + '|' + paymentData['razorpayServerPaymentResponse[razorpay_payment_id]']); 
                // Updating the hash (re-hashing) by adding Razprpay payment Id and order Id received from client as response
            
                let serverGeneratedSignature = hmac.digest('hex');
                // Converted the final hashed result into hexa code and saving it as server generated signature
    
                const razorpayServerGeneratedSignatureFromClient = paymentData['razorpayServerPaymentResponse[razorpay_signature]']
            
                if(serverGeneratedSignature === razorpayServerGeneratedSignatureFromClient){ 
                    // Checking that is the signature generated in our server using the secret key we obtained by hashing secretkey,orderId & paymentId is same as the signature sent by the server 
    
                    // console.log("Payment Signature Verified");
    
                    resolve()
            
                }else{
            
                    // console.log("Payment Signature Verification Failed");
    
                    reject()
            
                }
            
            }catch(error){
            
                console.error("Error from verifyOnlinePayment user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    updateOnlineOrderPaymentStatus : (ordersCollectionId, onlinePaymentStatus)=>{

        return new Promise((resolve,reject)=>{

            try{

                if(onlinePaymentStatus){

                    db.get().collection(collections.ORDERS_COLLECTION)
                    .updateOne(

                        { _id: ObjectId(ordersCollectionId) },

                        { $set: { orderStatus: "Order Placed" } }

                    ).then(() => {

                        resolve();

                    });
    
                }else{
    
                    db.get().collection(collections.ORDERS_COLLECTION)
                    .updateOne(
    
                        { _id: ObjectId(ordersCollectionId) },
    
                        { $set: { orderStatus: "Order Failed" } }
    
                    ).then(() => {
                        
                        resolve() 
                        
                    });
    
                }
            
            }catch(error){
            
                console.error("Error from updateOnlineOrderPaymentStatus user-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    createPaymentHistory : (userData,ordersCollectionId,checkoutData,orderValue,orderDataToRazorpay)=>{

        return new Promise( (resolve,reject)=>{

            try{

                const paymentData = {

                    userDetails : userData,
    
                    orderId : ordersCollectionId,
    
                    date: new Date(),
    
                    orderDetails : checkoutData,
    
                    amount : orderValue,
    
                    serverGeneratedOrderToPaymentGateway : orderDataToRazorpay
                }
    
                db.get().collection(collections.PAYMENT_HISTORY_COLLECTION).insertOne(paymentData)
                .then(()=>{
    
                    resolve();
    
                })
            
            }catch(error){
            
                console.error("Error from createPaymentHistory user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    updatePaymentHistory : (paymentHistoryCollectionId, paymentDataFromGateway)=>{

        return new Promise( (resolve,reject)=>{

            try{

                db.get().collection(collections.PAYMENT_HISTORY_COLLECTION).updateOne(

                    {_id:paymentHistoryCollectionId},
    
                    { $set: { razorpayServerResponse: paymentDataFromGateway }}
    
                ).then((data)=>{
    
                    resolve();
    
                })
            
            }catch(error){
            
                console.error("Error from updatePaymentHistory user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getPaymentHistoryId : (orderId)=>{

        return new Promise( (resolve,reject)=>{

            try{

                db.get().collection(collections.PAYMENT_HISTORY_COLLECTION).aggregate([

                    { $match: {"serverGeneratedOrderToPaymentGateway.id": orderId} },
                    
                    { $project: {_id: 1} }
    
                ]).toArray((error, result) => {
    
                    if (error) {
    
                      console.error("Error-1 from DB aggregation at getPaymentHistoryId user-helpers: ", error);
    
                      reject(error);
    
                    } else if (result.length > 0) {
    
                      const paymentHistoryId = result[0]._id;
    
                      resolve(paymentHistoryId);
       
                    } else {
    
                      console.error("Error-2 from getPaymentHistoryId =====> No document found with the specified criteria: ", result );
    
                      reject(result);
    
                    }
    
                });
            
            }catch(error){
            
                console.error("Error from getPaymentHistoryId user-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    requestOrderCancellation : (orderId)=>{
        
        return new Promise( async (resolve,reject)=>{

            try {

                const OrderDetails = await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
                    
                    {_id:ObjectId(orderId)},
                    
                    { $set: { cancellationStatus: "Pending Admin Approval" }}

                ).then((response)=>{

                    resolve(response);

                })
    
            } catch (error) {

                console.error("Error from requestOrderCancellation user-helpers: ", error);

                reject(error);

            }

        })

    },
    requestOrderReturn : (orderId)=>{
        
        return new Promise( async (resolve,reject)=>{

            try {

                await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
                    
                    {_id:ObjectId(orderId)},
                    
                    { $set: { returnStatus: "Pending Admin Approval" }}

                ).then((response)=>{

                    resolve(response);

                })
    
            } catch (error) {

                console.error("Error from requestOrderReturn user-helpers: ", error);

                reject(error);

            }

        })

    }

}
