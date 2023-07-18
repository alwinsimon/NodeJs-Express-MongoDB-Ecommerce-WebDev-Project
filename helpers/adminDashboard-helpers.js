const db = require("../config/externalConnectionsConfig");
const databaseCollections = require('../config/databaseCollectionsConfig')
const ObjectId = require("mongodb").ObjectId;
const moment = require('moment-timezone'); // Module to modify the time to various time zones

require('dotenv').config(); // Module to Load environment variables from .env file





const getUserCount = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const platformUsersCount = await db.get().collection(databaseCollections.USER_COLLECTION).countDocuments();

            resolve(platformUsersCount);

        }catch(error){

            console.error("Error from getUserCount adminDashboard-helpers: ", error);

            reject(error);

        }
  
    })
      
}


const getBlockedUsersCount = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const blockedPlatformUsersCount = await db.get().collection(databaseCollections.USER_COLLECTION).countDocuments({blocked:true});

            resolve(blockedPlatformUsersCount);

        }catch(error){

            console.error("Error from getBlockedUsersCount adminDashboard-helpers: ", error);

            reject(error);

        }
  
    })
      
}


const getProductsCount = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const productsCount = await db.get().collection(databaseCollections.PRODUCT_COLLECTION).countDocuments();

            resolve(productsCount);

        }catch(error){

            console.error("Error from getProductsCount adminDashboard-helpers: ", error);

            reject(error);

        }
  
    })
      
}


const getProductCategoriesCount = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const getProductCategoriesCount = await db.get().collection(databaseCollections.PRODUCT_CATEGORY_COLLECTION).countDocuments();

            resolve(getProductCategoriesCount);

        }catch(error){

            console.error("Error from getProductCategoriesCount adminDashboard-helpers: ", error);

            reject(error);

        }
  
    })
      
}


const getPlacedOrdersCount = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const placedOrdersCount = await db.get().collection(databaseCollections.ORDERS_COLLECTION).countDocuments({orderStatus: "Order Placed"});

            resolve(placedOrdersCount);

        }catch(error){

            console.error("Error from getProductCategoriesCount adminDashboard-helpers: ", error);

            reject(error);

        }
  
    })
      
}


const getShippedOrdersCount = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const shippedOrdersCount = await db.get().collection(databaseCollections.ORDERS_COLLECTION).countDocuments({orderStatus: "Order Shipped"});

            resolve(shippedOrdersCount);

        }catch(error){

            console.error("Error from getShippedOrdersCount adminDashboard-helpers: ", error);

            reject(error);

        }
  
    })
      
}


const getDeliveredOrdersCount = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const deliveredOrdersCount = await db.get().collection(databaseCollections.ORDERS_COLLECTION).countDocuments({orderStatus: "Delivered"});

            resolve(deliveredOrdersCount);

        }catch(error){

            console.error("Error from getDeliveredOrdersCount adminDashboard-helpers: ", error);

            reject(error);

        }
  
    })
      
}


const getCancelledOrdersCount = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const cancelledOrdersCount = await db.get().collection(databaseCollections.ORDERS_COLLECTION).countDocuments({orderStatus: "Cancelled"});

            resolve(cancelledOrdersCount);

        }catch(error){

            console.error("Error from getCancelledOrdersCount adminDashboard-helpers: ", error);

            reject(error);

        }
  
    })
      
}































module.exports = {

    getProductsCount,
    getProductCategoriesCount,
    getUserCount,
    getBlockedUsersCount,

    getPlacedOrdersCount,
    getShippedOrdersCount,
    getDeliveredOrdersCount,
    getCancelledOrdersCount

}