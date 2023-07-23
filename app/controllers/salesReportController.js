

const salesReportHelpers = require('../../helpers/salesReport-helpers');
const moment = require('moment-timezone'); // Module to modify the time to various time zones
const fs = require('fs');
const pdfMaker = require('pdfmake');

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

        let salesData = await salesReportHelpers.getRecentMonthSalesData();

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


const getCustomDurationSalesDataPOST = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const reportTitle = "Custom Duration Sales Report";

        let fromDate = req.body.fromDate;
        let tillDate = req.body.tillDate;

        if( fromDate > tillDate ){ // Correct the dates by swapping, if user has provided a wrong input
            
            // Swap fromDate and tillDate using destructuring assignment
            [fromDate, tillDate] = [tillDate, fromDate];

        }

        const salesAmount = await salesReportHelpers.getCustomDurationSalesAmount(fromDate, tillDate);

        let salesData = await salesReportHelpers.getCustomDurationSalesData(fromDate, tillDate);

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

        // Formatting the date in "DD-MM-YYYY" format to display in user-side
        fromDate = moment(fromDate).format('DD-MM-YYYY');
        tillDate = moment(tillDate).format('DD-MM-YYYY');

        const dataToRender = {

            layout: 'admin-layout',
            PLATFORM_NAME,
            title: PLATFORM_NAME + " || Custom Duration Sales Report",
            adminData,

            reportTitle,

            fromDate,
            tillDate,

            salesAmount,
            salesDataToTable

        }

        res.render('admin/sales-report', dataToRender);

    }catch(error){
  
        console.log("Error from getCustomDurationSalesDataPOST salesReportController: ", error);
  
        res.redirect('/admin/error-page');
  
    }

}


const downloadSalesReportPOST = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        const writeStream = fs.createWriteStream("Sales report.pdf" );

        const printer = new pdfMaker({

            Roboto: {

                normal: "Helvetica",
                bold: "Helvetica-Bold",
                italics: "Helvetica-Oblique",
                bolditalics: "Helvetica-BoldOblique"

            }

        });

        const totalSalesAmount = await salesReportHelpers.getTotalSales();

        let salesData = await salesReportHelpers.getTotalSalesData();

        const dateOptions = { year: "numeric", month: "long", day: "numeric" };
        
        // Create document definition
        const docDefinition = {

            content: [

                { text: PLATFORM_NAME, style: "header" },
                { text: "\n" },
                { text: "Consolidated Sales Report", style: "header1" },
                { text: "\n" },
                { text: "\n" }

            ],
            styles: {

                header: {fontSize: 25, alignment: "center"},
                header1: {fontSize: 12, alignment: "center"},
                total: {fontSize: 18, alignment: "center"}

            }

        };

        // Create the table data
        const tableBody = [

            // Table header
            ["Index", "Date", "User", "Actual Price", "Product Discounts", "Category Discounts", "Coupon Discounts", "Status", "Method", "Amount"]

        ];

        for (let i = 0; i < salesData.length; i++) {

            const singleSalesData = salesData[i];

            const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(new Date(singleSalesData.date));

            tableBody.push([
                
                (i + 1).toString(), // Index value
                formattedDate,
                singleSalesData.userName,
                singleSalesData.actualOrderValue,
                singleSalesData.productOfferDiscount,
                singleSalesData.categoryOfferDiscount,
                singleSalesData.couponDiscount,
                singleSalesData.orderStatus,
                singleSalesData.paymentMethod,
                singleSalesData.orderValue

            ]);

        }

        const table = {

            table: {

                widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
                headerRows: 1,
                body: tableBody

            }

        };

        // Add the table to the document definition
        docDefinition.content.push(table);
        docDefinition.content.push([

            { text: "\n" },
            { text: "\n" },
            { text: "\n" },
            { text: `Total Amount: ${totalSalesAmount || 0}`, style: "total" },
            { text: "\n" },
            { text: "\n" },
            { text: "Generated by "+ adminData.name + " from "  + PLATFORM_NAME + "'s Admin Dashboard" },
            { text: "\n" },
            { text: "\n" },
            { text: "Generated On: " + new Date() }

        ]);

        // Generate PDF from the document definition
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        // Pipe the PDF document to a write stream
        pdfDoc.pipe(writeStream);

        // Finalize the PDF and end the stream
        pdfDoc.end();

        writeStream.on("finish", () => {

            res.download("Sales report.pdf" );

        });

    }catch(error){
  
        console.log("Error from downloadSalesReportPOST salesReportController: ", error);
  
        res.redirect('/admin/error-page');
  
    }

}












module.exports = {

    salesPageGET,
    weeklySalesPageGET,
    monthlySalesPageGET,
    yearlySalesPageGET,
    totalSalesPageGET,

    getCustomDurationSalesDataPOST,

    downloadSalesReportPOST

}