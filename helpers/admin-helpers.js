const db = require("../config/externalConnectionsConfig");
const collections = require('../config/databaseCollectionsConfig')
const bcrypt = require('bcrypt');
const ObjectId = require("mongodb").ObjectId;
const path = require('path');
const fs = require('fs');
const paymentGateway = require("../config/externalConnectionsConfig");
const moment = require('moment-timezone'); // Module to modify the time to various time zones

require('dotenv').config(); // Module to Load environment variables from .env file





module.exports = {

  doAdminLogin:(loginFormData)=>{

    return new Promise( async (resolve,reject)=>{

      try{

        let adminAuthenticationResponse = {};

        const admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({email:loginFormData.email});
  
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

      }catch(error){
    
        console.error("Error from doAdminLogin admin-helper: ", error);
    
        reject(error);
    
      }

    })

  },
  addNewAdmin:(newAdminDetails)=>{

    return new Promise( async (resolve,reject)=>{

      try{

        newAdminDetails.password = await bcrypt.hash(newAdminDetails.password, 10);

        db.get().collection(collections.ADMIN_COLLECTION).insertOne(newAdminDetails).then((result)=>{
  
          resolve(result._insertedId);
  
        })

      }catch(error){
    
        console.error("Error from addNewAdmin admin-helper: ", error);
    
        reject(error);
    
      }

    });

  },
  addProductCategory:(categoryDetails)=>{

    return new Promise((resolve,reject)=>{

      try{

        db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).insertOne(categoryDetails).then((response)=>{
  
          resolve(response.insertedId);
  
        }).catch((error)=>{
    
          console.log("Error from db operation in addProductCategory admin helper:", error);

          reject(error);
                
        });

      }catch(error){
    
        console.error("Error from addProductCategory admin-helper: ", error);
    
        reject(error);
    
      }

    })

  },
  checkProductCategoryExists: (categoryName)=>{

    return new Promise( async (resolve,reject)=>{

      try{

        let categoryNameToMatch = categoryName;

        categoryNameToMatch = new RegExp(`^${categoryNameToMatch}$`, 'i'); // Used for making an case insensitive search in DB

        const productCategory = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).find({name:categoryNameToMatch}).toArray();

        if(productCategory[0]){  // Product category already exist in DB
  
          let response = {
            status:true,
            message: "Product Category Already Exists - New category Addition FAILED"
          }
  
          resolve(response);
  
        }else{ // Product category DOSEN'T exist in DB
  
          let response = {
            status:false,
            message: "Product Category Dosen't Exist"
          }
  
          resolve(response);
  
        }

      }catch(error){
    
        console.error("Error from checkProductCategoryExists admin-helper: ", error);
    
        reject(error);
    
      }

    })

  },
  getProductCategories: () => {

    return new Promise(async (resolve, reject) => {

      try {

        let productCategories = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).find({}).toArray();
  
        productCategories = productCategories.map(category => { // For Converting the time from DB to IST

          const createdOnIST = moment(category.createdOn)
          .tz('Asia/Kolkata')
          .format('DD-MMM-YYYY h:mm A');
  
          return { ...category, createdOn: createdOnIST + ' IST' };

        });
  
        resolve(productCategories);

      } catch (error) {

        console.error("Error from getProductCategories admin-helper: ", error);

        reject(error);

      }

    });

  },
  getProductCategoryDetails: (categoryId) => {

    return new Promise( async (resolve, reject) => {

      try {

        const categoryDetails = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).findOne({_id:ObjectId(categoryId)});

        resolve(categoryDetails);

      } catch (error) {

        console.error("Error from getProductCategoryDetails admin-helper: ", error);

        reject(error);

      }

    });

  },
  updateProductCategory: (categoryId, newData)=>{

    return new Promise( async (resolve, reject) => {

      try {

        await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).updateOne({_id:ObjectId(categoryId)}, {$set:newData}).then((result)=>{

          resolve(result);

        })
  

      } catch (error) {

        console.error("Error from updateProductCategory admin-helper: ", error);

        reject(error);

      }

    });

  },
  deleteProductCategory : (categoryId)=>{

    return new Promise( async (resolve, reject) => {

      try {

        //Function find the product category document to delete from MongoDb collection
        const productCategoryToRemove = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).findOne({ _id: ObjectId(categoryId) });

        // Function to Delete the image file from the server using fs.unlink
        const image = productCategoryToRemove.categoryImage;
        const imagePath = './public/product-category-images/' + image;

        fs.unlink(imagePath, (error) => {

          if (error) {

            console.error("Error-1 from fs.unlink function at deleteProductCategory admin-helpers: ", error);

          }

        })

        //Function to delete the document from MongoDb collection
        const removeProductCategory = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(categoryId) });

        resolve(removeProductCategory);

      } catch (error) {

        console.error("Error from deleteProductCategory admin-helper: ", error);

        reject(error);

      }

    });

  },
  getAllUsers : ()=>{

    return new Promise( async (resolve, reject) => {

      try {

        let platformUsers = await db.get().collection(collections.USER_COLLECTION).find({}).toArray();

        platformUsers = platformUsers.map(user => {

          const joinedOnIST = moment(user.joinedOn).tz('Asia/Kolkata').format('DD-MMM-YYYY h:mm A');
        
          return { ...user, joinedOn: joinedOnIST + ' IST' };
          
        });
        
        resolve(platformUsers);
  

      } catch (error) {

        console.error("Error from getAllUsers admin-helper: ", error);

        reject(error);

      }

    });

  },
  changeUserBlockStatus : (userId)=>{

    return new Promise( async (resolve, reject) => {

      try {

        const user = await db.get().collection(collections.USER_COLLECTION).findOne({_id:ObjectId(userId)});

        if(user.blocked){ // If the user is already blocked => UN-BLOCK

          await db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(userId)}, {$set:{blocked:false}}).then((result)=>{

            resolve(result);
  
          })

        }else{ // If the user is NOT BLOCKED => BLOCK

          await db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(userId)}, {$set:{blocked:true}}).then((result)=>{

            resolve(result);
  
          })

        }

      } catch (error) {

        console.error("Error from changeUserBlockStatus admin-helper: ", error);

        reject(error);

      }

    });

  },
  getAllOrders : ()=>{

    return new Promise( async (resolve, reject) => {

      try {

        let platformOrders = await db.get().collection(collections.ORDERS_COLLECTION).find({}).sort({ date: -1 }).toArray();

        platformOrders = platformOrders.map(order => {

          const { date, ...rest } = order;

          const orderedAtIST = moment(date).tz('Asia/Kolkata').format('DD-MMM-YYYY h:mm A');

          return { ...rest, date: orderedAtIST + ' IST' };
          
        });
        
        resolve(platformOrders);

      } catch (error) {

        console.error("Error from getAllOrders admin-helper: ", error);

        reject(error);

      }

    });

  },
  getSingleOrderData : (orderId)=>{

    return new Promise( async (resolve, reject) => {

      try {

        const singleOrderData = await db.get().collection(collections.ORDERS_COLLECTION).findOne({_id:ObjectId(orderId)});
        
        resolve(singleOrderData);
  
      } catch (error) {

        console.error("Error from getSingleOrderData admin-helper: ", error);

        reject(error);

      }

    });

  },
  getSingleOrderDataForOrdersDisplay : (orderId)=>{

    return new Promise( async (resolve, reject) => {

      try {

        const orderData = await db.get().collection(collections.ORDERS_COLLECTION).aggregate([
                
          { $match:{_id:ObjectId(orderId)} },

          { $unwind:'$products' },
          
          { $project:{ item:'$products.item', quantity:'$products.quantity'} },

          { $lookup:
            
            {
              from:collections.PRODUCT_COLLECTION,

              localField:'item',

              foreignField:'_id',

              as:'product'
            }

          },

          { $project:{item:1, quantity:1, product:{$arrayElemAt:['$product',0]}} }

        ]).toArray();
        
        resolve(orderData);

      } catch (error) {

        console.error("Error from getSingleOrderDataForOrdersDisplay admin-helper: ", error);

        reject(error);

      }

    });

  },
  updateOrderStatus: (orderId,status)=>{

    return new Promise( async (resolve, reject) => {

      try {

        if(status === "shipped"){

          await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
            
            {_id : ObjectId(orderId)},
            {$set: {orderStatus: "Order Shipped"}}
            
          );
          
        }else if (status === "delivered"){

          await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
            
            {_id : ObjectId(orderId)},
            {$set: {orderStatus: "Delivered"}}
            
          );

        }
        
        resolve();

      } catch (error) {

        console.error("Error from updateOrderStatus admin-helper: ", error);

        reject(error);

      }

    });

  },
  manageOrderCancellation : (orderId, approve, adminRequest)=>{

    return new Promise( async (resolve, reject) => {

      try {

        if(approve){

          if(adminRequest){

            try {

              await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
            
                {_id : ObjectId(orderId)},
                {$set: {cancelledOrder: true, cancellationStatus: "Cancelled by Platform", orderStatus: "Cancelled"}}
              
              );

              resolve({refundAvailable : true});

            } catch(error) {

              console.error("Error-4 from manageOrderCancellation admin-helper:", error);

              reject(error);

            }

          }else{

            try {
              
              await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
            
                {_id : ObjectId(orderId)},
                {$set: {cancelledOrder: true, cancellationStatus: "Cancellation Request Approved", orderStatus: "Cancelled"}}
              
              );

              resolve({refundAvailable : true});
              
            } catch(error) {

              console.error("Error-3 from manageOrderCancellation admin-helper:", error);

              reject(error);

            }

          }
          
        }else{

          try{

            await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
            
              {_id : ObjectId(orderId)},
              {$set: {cancelledOrder: false, cancellationStatus: "Cancellation Request Rejected"}}
              
            );
  
            resolve({refundAvailable : false});

          } catch(error) {

            console.error("Error-2 from manageOrderCancellation admin-helper:", error);

            reject(error);

          }

        }

      } catch (error) {

        console.error("Error from manageOrderCancellation admin-helper: ", error);

        reject(error);

      }

    });

  },
  updateInventoryForOrderCancellationAndReturn : (orderId)=>{

    return new Promise( async(resolve,reject)=>{

      try{

        const orderToCancell = await db.get().collection(collections.ORDERS_COLLECTION).findOne({_id:ObjectId(orderId)});

        if( orderToCancell && orderToCancell != null ){
          
          // if order exist in db orders collection
          const orderProductsWithQuantity = orderToCancell.products;

          // Iterate over each product in the order
          for (const product of orderProductsWithQuantity) {

            const productId = product.item;

            const quantity = product.quantity;

            // Add to the available stock of the product in the product collection
            const updateInventory = await db.get().collection(collections.PRODUCT_COLLECTION)
            .updateOne(
                
              { _id: ObjectId(productId) },

              { $inc: { availableStock: quantity } }

            )

          }

          resolve({ status: true });

        }else{ 
            
          // Send a error message if order dosen't exist in db orders collection

          resolve({status: false, result: orderToCancell, error: "Order Dosent Exist or No products in the Order"});

        }
      
      }catch(error){
      
        console.error("Error from updateInventoryForOrderCancellationAndReturn admin-helpers: ", error);
    
        reject(error);
      
      }

    })

  },
  manageOrderReturn : (orderId, approve)=>{

    return new Promise( async (resolve, reject) => {

      try {

        if(approve){

          await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
            
            {_id : ObjectId(orderId)},
            {$set: {returnedOrder: true, returnStatus: "Return Request Approved", orderStatus: "Returned"}}
            
          );

          resolve( {refundAvailable: true} );
          
        }else{

          await db.get().collection(collections.ORDERS_COLLECTION).updateOne(
            
            {_id : ObjectId(orderId)},
            {$set: {returnedOrder: false, returnStatus: "Return Request Rejected"}}
            
          );

          resolve( {refundAvailable: false} );

        }

      } catch (error) {

        console.error("Error from manageOrderReturn admin-helper: ", error);

        reject(error);

      }

    });

  },
  // ====================== Function to Add balence to user wallet in-case of ORDER CANCELLATION OR RETURN ======================
  addRefundToWalletBalance : (orderId, orderCancellationRequest, orderReturnRequest) => {

    return new Promise( async (resolve, reject) =>{

      try{

        const orderData = await db.get().collection(collections.ORDERS_COLLECTION).findOne({_id: ObjectId(orderId)});

        const userId = orderData.userId.toString();

        const userWallet = await db.get().collection(collections.WALLET_COLLECTION).findOne({userId: ObjectId(userId)});

        const refundAmount = orderData.orderValue;

        if(userWallet === null){ // If there is no existing wallet for user, create one

          db.get().collection(collections.WALLET_COLLECTION).insertOne({userId: ObjectId(userId), walletBalance: 0});

        }

        if(orderCancellationRequest){

          if(orderData.paymentMethod === "ONLINE"){ // If the payment was ONLINE resolve with required data to do wallet refund

            try {

              await db.get().collection(collections.WALLET_COLLECTION).updateOne(

                { userId: ObjectId(userId) },

                { $inc: { walletBalance: refundAmount } }
                
              );
    
              resolve({refundSuccess : true});
        
            } catch (error) {
        
              console.error("Error in addRefundToWalletBalance admin-helpers while adding order CANCELLATION refund to wallet balance:", error);
    
              reject(error);
        
            }
            
          }else{

            resolve();

          }

        }else if(orderReturnRequest){ 

          try {

            await db.get().collection(collections.WALLET_COLLECTION).updateOne(
              { userId: ObjectId(userId) },
              { $inc: { walletBalance: refundAmount } }
            );
  
            resolve({refundSuccess : true});
      
          } catch (error) {
      
            console.error("Error in addRefundToWalletBalance admin-helpers while adding order RETURN refund to wallet balance:", error);
  
            reject(error);
      
          }

        }

      } catch (error) {

        console.error("Error from addRefundToWalletBalance admin-helper: ", error);

        reject(error);

      }

    })

  }
      
      

}