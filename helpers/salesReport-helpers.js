const db = require("../config/externalConnectionsConfig");
const databaseCollections = require('../config/databaseCollectionsConfig')
const ObjectId = require("mongodb").ObjectId;
const moment = require('moment-timezone'); // Module to modify the time to various time zones

require('dotenv').config(); // Module to Load environment variables from .env file


// ======================================================= Daily Sales Data Helpers =======================================================

const getTodaysSales = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const todaysDate = new Date();
            todaysDate.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const pipeline = [

              { $match: { orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] }, date: { $gte: todaysDate } } },

              { $group: { _id: null, totalOrderValue: { $sum: "$orderValue" } } }

            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let sumOfOrderValues = 0;
      
            if (salesQueryResult.length > 0) {

              sumOfOrderValues = salesQueryResult[0].totalOrderValue;
            
            }
      
            resolve(sumOfOrderValues);

        }catch(error){

            console.error("Error from getTodaysSales salesReport-helpers: ", error);

            reject(error);

        }

    });

};


const getTodaysSalesData = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const todaysDate = new Date();
            todaysDate.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const pipeline = [

              { $match: { orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] }, date: { $gte: todaysDate } } }

            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            resolve(salesQueryResult);

        }catch(error){

            console.error("Error from getTodaysSalesData salesReport-helpers: ", error);

            reject(error);

        }

    });

};


// ======================================================= Weekly Sales Data Helpers =======================================================

const getRecentWeekSales = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const endDate = new Date(); // Current date
            endDate.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const startDate = new Date(endDate); // Create a copy of the current date.
            startDate.setDate(startDate.getDate() - 7); // Subtract 7 days to get the start date of the week.

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] },
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrderValue: { $sum: "$orderValue" }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let sumOfOrderValues = 0;
      
            if (salesQueryResult.length > 0) {

              sumOfOrderValues = salesQueryResult[0].totalOrderValue;
            
            }
      
            resolve(sumOfOrderValues);

        }catch(error){

            console.error("Error from getRecentWeekSales salesReport-helpers: ", error);

            reject(error);

        }

    });

};


const getRecentWeekSalesData = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const endDate = new Date(); // Current date
            endDate.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const startDate = new Date(endDate); // Create a copy of the current date.
            startDate.setDate(startDate.getDate() - 7); // Subtract 7 days to get the start date of the week.

            const pipeline = [
                {
                    $match: {

                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] },

                        date: { $gte: startDate, $lte: endDate }

                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            resolve(salesQueryResult);

        }catch(error){

            console.error("Error from getRecentWeekSalesData salesReport-helpers: ", error);

            reject(error);

        }

    });

};


// ======================================================= Monthly Sales Data Helpers =======================================================

const getRecentMonthSales = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const currentDate = new Date(); // Current date

            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            firstDayOfMonth.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            lastDayOfMonth.setHours(23, 59, 59, 999); // Setting the time to end of the day.

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] },
                        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrderValue: { $sum: "$orderValue" }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let sumOfOrderValues = 0;
      
            if (salesQueryResult.length > 0) {

              sumOfOrderValues = salesQueryResult[0].totalOrderValue;
            
            }
      
            resolve(sumOfOrderValues);

        }catch(error){

            console.error("Error from getRecentMonthSales salesReport-helpers: ", error);

            reject(error);

        }

    });

};


const getRecentMonthSalesData = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const currentDate = new Date(); // Current date

            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            firstDayOfMonth.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            lastDayOfMonth.setHours(23, 59, 59, 999); // Setting the time to end of the day.

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] },
                        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            resolve(salesQueryResult);

        }catch(error){

            console.error("Error from getRecentMonthSalesData salesReport-helpers: ", error);

            reject(error);

        }

    });

};


// ======================================================= Yearly Sales Data Helpers =======================================================

const getRecentYearSales = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const currentDate = new Date(); // Current date

            const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
            firstDayOfYear.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);
            lastDayOfYear.setHours(23, 59, 59, 999); // Setting the time to end of the day.

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] },
                        date: { $gte: firstDayOfYear, $lte: lastDayOfYear }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrderValue: { $sum: "$orderValue" }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let sumOfOrderValues = 0;
      
            if (salesQueryResult.length > 0) {

              sumOfOrderValues = salesQueryResult[0].totalOrderValue;
            
            }
      
            resolve(sumOfOrderValues);

        }catch(error){

            console.error("Error from getRecentYearSales salesReport-helpers: ", error);

            reject(error);

        }

    });

};


const getRecentYearSalesData = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const currentDate = new Date(); // Current date

            const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
            firstDayOfYear.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);
            lastDayOfYear.setHours(23, 59, 59, 999); // Setting the time to end of the day.

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] },
                        date: { $gte: firstDayOfYear, $lte: lastDayOfYear }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            resolve(salesQueryResult);

        }catch(error){

            console.error("Error from getRecentYearSalesData salesReport-helpers: ", error);

            reject(error);

        }

    });

};


// ======================================================= Yearly Sales Data Helpers =======================================================

const getTotalSales = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrderValue: { $sum: "$orderValue" }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let sumOfOrderValues = 0;
      
            if (salesQueryResult.length > 0) {

              sumOfOrderValues = salesQueryResult[0].totalOrderValue;
            
            }
      
            resolve(sumOfOrderValues);

        }catch(error){

            console.error("Error from getTotalSales salesReport-helpers: ", error);

            reject(error);

        }

    });

};


const getTotalSalesData = () => {

    return new Promise(async (resolve, reject) => {

        try{

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            resolve(salesQueryResult);

        }catch(error){

            console.error("Error from getTotalSalesData salesReport-helpers: ", error);

            reject(error);

        }

    });

};


// ======================================================= Custom Duration Sales Data Helpers =======================================================

const getCustomDurationSalesAmount = ( requestedFromDate, requestedTillDate ) => {

    return new Promise(async (resolve, reject) => {

        try{

            const fromDate = new Date(requestedFromDate);
            fromDate.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const tillDate = new Date(requestedTillDate);
            tillDate.setHours(23, 59, 59, 999); // Setting the time to end of the day.

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] },
                        date: { $gte: fromDate, $lte: tillDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrderValue: { $sum: "$orderValue" }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            let sumOfOrderValues = 0;
      
            if (salesQueryResult.length > 0) {

              sumOfOrderValues = salesQueryResult[0].totalOrderValue;
            
            }
      
            resolve(sumOfOrderValues);

        }catch(error){

            console.error("Error from getCustomDurationSalesAmount salesReport-helpers: ", error);

            reject(error);

        }

    });

};


const getCustomDurationSalesData = (requestedFromDate, requestedTillDate) => {

    return new Promise(async (resolve, reject) => {

        try{

            const fromDate = new Date(requestedFromDate);
            fromDate.setHours(0, 0, 0, 0); // Setting the time to start of the day.

            const tillDate = new Date(requestedTillDate);
            tillDate.setHours(23, 59, 59, 999); // Setting the time to end of the day.

            const pipeline = [
                {
                    $match: {
                        orderStatus: { $nin: ["Cancelled", "Returned", "Payment Pending"] },
                        date: { $gte: fromDate, $lte: tillDate }
                    }
                }
            ];
      
            const salesQueryResult = await db.get().collection(databaseCollections.ORDERS_COLLECTION).aggregate(pipeline).toArray();
      
            resolve(salesQueryResult);

        }catch(error){

            console.error("Error from getCustomDurationSalesData salesReport-helpers: ", error);

            reject(error);

        }

    });

};






















module.exports = {

    getTodaysSales,
    getTodaysSalesData,

    getRecentWeekSales,
    getRecentWeekSalesData,

    getRecentMonthSales,
    getRecentMonthSalesData,

    getRecentYearSales,
    getRecentYearSalesData,

    getTotalSales,
    getTotalSalesData,

    getCustomDurationSalesAmount,
    getCustomDurationSalesData

}