

const salesReportHelpers = require('../../helpers/salesReport-helpers');
const moment = require('moment-timezone'); // Module to modify the time to various time zones

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"



/* ============================================= ADMIN SALES PAGE CONTROLLER ============================================= */


const salesPageGET = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const reportTitle = "Todays Sales";

        const salesAmount = await salesReportHelpers.getTodaysSales();

        let salesData = await salesReportHelpers.getTodaysSalesData();

        let salesDataToTable = false;

        if(salesData.length >0){

            salesData = salesData.map(data => { // For Converting the time from DB to IST
    
                const createdOnIST = moment(data.date)
                .tz('Asia/Kolkata')
                .format('DD-MMM-YYYY hh:mm:ss A');
        
                return { ...data, date: createdOnIST };
  
            });

            salesDataToTable = salesData;

        }

        const dataToRender = {

            layout: 'admin-layout',
            PLATFORM_NAME,
            title: PLATFORM_NAME + " || Today's Sales Report",
            adminData,

            reportTitle,
            salesAmount,
            salesDataToTable

        }

        res.render('admin/sales-report', dataToRender);

    }catch(error){
  
        console.log("Error from salesPageGET salesReportController: ", error);
  
        res.redirect('/admin/error-page');
  
    }

}


const weeklySalesPageGET = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const reportTitle = "Weekly Sales";

        const salesAmount = await salesReportHelpers.getRecentWeekSales();

        let salesData = await salesReportHelpers.getRecentWeekSalesData();

        let salesDataToTable = false;

        if(salesData.length >0){

            salesData = salesData.map(data => { // For Converting the time from DB to IST
    
                const createdOnIST = moment(data.date)
                .tz('Asia/Kolkata')
                .format('DD-MMM-YYYY hh:mm:ss A');
        
                return { ...data, date: createdOnIST };
  
            });

            salesDataToTable = salesData;

        }

        const dataToRender = {

            layout: 'admin-layout',
            PLATFORM_NAME,
            title: PLATFORM_NAME + " || Weekly Sales Report",
            adminData,

            reportTitle,
            salesAmount,
            salesDataToTable

        }

        res.render('admin/sales-report', dataToRender);

    }catch(error){
  
        console.log("Error from weeklySalesPageGET salesReportController: ", error);
  
        res.redirect('/admin/error-page');
  
    }

}


const monthlySalesPageGET = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const reportTitle = "Monthly Sales";

        const salesAmount = await salesReportHelpers.getRecentMonthSales();

        let salesData = await salesReportHelpers.getRecentWeekSalesData();

        let salesDataToTable = false;

        if(salesData.length >0){

            salesData = salesData.map(data => { // For Converting the time from DB to IST
    
                const createdOnIST = moment(data.date)
                .tz('Asia/Kolkata')
                .format('DD-MMM-YYYY hh:mm:ss A');
        
                return { ...data, date: createdOnIST };
  
            });

            salesDataToTable = salesData;

        }

        const dataToRender = {

            layout: 'admin-layout',
            PLATFORM_NAME,
            title: PLATFORM_NAME + " || Monthly Sales Report",
            adminData,

            reportTitle,
            salesAmount,
            salesDataToTable

        }

        res.render('admin/sales-report', dataToRender);

    }catch(error){
  
        console.log("Error from monthlySalesPageGET salesReportController: ", error);
  
        res.redirect('/admin/error-page');
  
    }

}


const yearlySalesPageGET = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const reportTitle = "Yearly Sales";

        const salesAmount = await salesReportHelpers.getRecentYearSales();

        let salesData = await salesReportHelpers.getRecentYearSalesData();

        let salesDataToTable = false;

        if(salesData.length >0){

            salesData = salesData.map(data => { // For Converting the time from DB to IST
    
                const createdOnIST = moment(data.date)
                .tz('Asia/Kolkata')
                .format('DD-MMM-YYYY hh:mm:ss A');
        
                return { ...data, date: createdOnIST };
  
            });

            salesDataToTable = salesData;

        }

        const dataToRender = {

            layout: 'admin-layout',
            PLATFORM_NAME,
            title: PLATFORM_NAME + " || Yearly Sales Report",
            adminData,

            reportTitle,
            salesAmount,
            salesDataToTable

        }

        res.render('admin/sales-report', dataToRender);

    }catch(error){
  
        console.log("Error from yearlySalesPageGET salesReportController: ", error);
  
        res.redirect('/admin/error-page');
  
    }

}


const totalSalesPageGET = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const reportTitle = "Total Sales";

        const salesAmount = await salesReportHelpers.getTotalSales();

        let salesData = await salesReportHelpers.getTotalSalesData();

        let salesDataToTable = false;

        if(salesData.length >0){

            salesData = salesData.map(data => { // For Converting the time from DB to IST
    
                const createdOnIST = moment(data.date)
                .tz('Asia/Kolkata')
                .format('DD-MMM-YYYY hh:mm:ss A');
        
                return { ...data, date: createdOnIST };
  
            });

            salesDataToTable = salesData;

        }

        const dataToRender = {

            layout: 'admin-layout',
            PLATFORM_NAME,
            title: PLATFORM_NAME + " || Total Sales Report",
            adminData,

            reportTitle,
            salesAmount,
            salesDataToTable

        }

        res.render('admin/sales-report', dataToRender);

    }catch(error){
  
        console.log("Error from totalSalesPageGET salesReportController: ", error);
  
        res.redirect('/admin/error-page');
  
    }

}












module.exports = {

    salesPageGET,
    weeklySalesPageGET,
    monthlySalesPageGET,
    yearlySalesPageGET,
    totalSalesPageGET

}