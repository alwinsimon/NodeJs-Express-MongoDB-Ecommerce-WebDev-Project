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


const getTotalSales = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const pipeline = [

                { $match: { orderStatus: { $nin: ["Cancelled", "Returned"] } } },
      
                { $group: { _id: null, totalOrderValue: { $sum: "$orderValue" } }}
              
            ];
        
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
    
            let sumOfOrderValues = 0;

            if(salesQueryResult.length > 0){

                sumOfOrderValues = salesQueryResult[0].totalOrderValue;
        
                resolve(sumOfOrderValues);

            }else{
            
                resolve(sumOfOrderValues);

            }
        

        }catch(error){

            console.error("Error from getTotalSales adminDashboard-helpers: ", error);

            reject(error);

        }

    });

};


const getTodaysSales = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const todaysDate = new Date();
            todaysDate.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const pipeline = [

              { $match: { orderStatus: { $nin: ["Cancelled", "Returned"] }, date: { $gte: todaysDate } } },

              { $group: { _id: null, totalOrderValue: { $sum: "$orderValue" } } }

            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let sumOfOrderValues = 0;
      
            if (salesQueryResult.length > 0) {

              sumOfOrderValues = salesQueryResult[0].totalOrderValue;
            
            }
      
            resolve(sumOfOrderValues);

        }catch(error){

            console.error("Error from getTodaysSales adminDashboard-helpers: ", error);

            reject(error);

        }

    });

};


const getTodaysSalesCount = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const todaysDate = new Date();
            todaysDate.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const pipeline = [

              { $match: { orderStatus: { $nin: ["Cancelled", "Returned"] }, date: { $gte: todaysDate } } },

              { $count: "salesCount" }, // Used to get the count of matching documents

            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let todaysSalesCount = 0;
      
            if (salesQueryResult.length > 0) {

              todaysSalesCount = salesQueryResult[0].salesCount;
            
            }
      
            resolve(todaysSalesCount);

        }catch(error){

            console.error("Error from getTodaysSalesCount adminDashboard-helpers: ", error);

            reject(error);

        }

    });

};


const getTotalSalesCount = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const pipeline = [

              { $match: { orderStatus: { $nin: ["Cancelled", "Returned"] } } },

              { $count: "salesCount" } // Used to get the count of matching documents

            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let totalSalesCount = 0;
      
            if (salesQueryResult.length > 0) {

                totalSalesCount = salesQueryResult[0].salesCount;
            
            }
      
            resolve(totalSalesCount);

        }catch(error){

            console.error("Error from getTotalSalesCount adminDashboard-helpers: ", error);

            reject(error);

        }

    });

};


const getPaymentMethodsWithVolumeAndUsageCount = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const pipeline = [

              { $match: { orderStatus: { $nin: ["Cancelled", "Returned"] } } },

              {
                $group: {
                  _id: "$paymentMethod",
                  orderVolume: { $sum: "$orderValue" },
                  usageCount: { $sum: 1 },
                },
              },

              {
                $project: {
                    paymentMethod: "$_id",
                    orderVolume: 1,
                    usageCount: 1,
                    _id: 0,
                }
              }

            ];
      
            const paymentDataQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            resolve(paymentDataQueryResult);

        }catch(error){

            console.error("Error from getPaymentMethodsWithVolumeAndUsageCount adminDashboard-helpers: ", error);

            reject(error);

        }

    });

};


const getMonthlySalesData = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const pipeline = [

              { $match: { orderStatus: { $nin: ["Cancelled", "Returned"] } } },

              {
                $group: {
                    _id: { $month: "$date" },
                    totalSales: { $sum: "$orderValue" }
                }
              },

              {
                $sort: {_id: 1}
              }

            ];
      
            const monthlySalesDataQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            resolve(monthlySalesDataQueryResult);

        }catch(error){

            console.error("Error from getMonthlySalesData adminDashboard-helpers: ", error);

            reject(error);

        }

    });

};

























module.exports = {

    getProductsCount,
    getProductCategoriesCount,
    getUserCount,
    getBlockedUsersCount,

    getPlacedOrdersCount,
    getShippedOrdersCount,
    getDeliveredOrdersCount,
    getCancelledOrdersCount,

    getTotalSales,
    getTodaysSales,

    getTotalSalesCount,
    getTodaysSalesCount,

    getMonthlySalesData,
    getPaymentMethodsWithVolumeAndUsageCount

}