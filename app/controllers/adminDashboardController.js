

const adminHelpers = require('../../helpers/admin-helpers');
const adminDashboardHelpers = require('../../helpers/adminDashboard-helpers');

require('dotenv').config(); // Module to Load environment variables from .env file


const PLATFORM_NAME = process.env.PLATFORM_NAME || "GetMyDeal"



/* ============================================= ADMIN DASHBOARD CONTROLLER ============================================= */


const adminDashboardGET = async (req,res)=>{

    try{

        const adminData = req.session.adminSession;

        // ====================== Various Metrics as Counts ======================
        const productsCount = await adminDashboardHelpers.getProductsCount();
        const getProductCategoriesCount = await adminDashboardHelpers.getProductCategoriesCount();
        const platformUsersCount = await adminDashboardHelpers.getUserCount();
        const blockedPlatformUsersCount = await adminDashboardHelpers.getBlockedUsersCount();

        const placedOrdersCount = await adminDashboardHelpers.getPlacedOrdersCount();
        const shippedOrdersCount = await adminDashboardHelpers.getShippedOrdersCount();
        const deliveredOrdersCount = await adminDashboardHelpers.getDeliveredOrdersCount();
        const cancelledOrdersCount = await adminDashboardHelpers.getCancelledOrdersCount();

        const totalSales = await adminDashboardHelpers.getTotalSales();
        const todaysSales = await adminDashboardHelpers.getTodaysSales();

        const todaysSalesCount = await adminDashboardHelpers.getTodaysSalesCount();
        const totalSalesCount = await adminDashboardHelpers.getTotalSalesCount();

        let monthlySalesData = await adminDashboardHelpers.getMonthlySalesData();
        monthlySalesData = encodeURIComponent(JSON.stringify(monthlySalesData)); // Encoding to display in chart/graph

        let paymentAnalytics = await adminDashboardHelpers.getPaymentMethodsWithVolumeAndUsageCount();
        paymentAnalytics = encodeURIComponent(JSON.stringify(paymentAnalytics)); // Encoding to display in chart/graph

        const platformOrdersData = await adminHelpers.getAllOrders();

        const dataToRender = {

            layout: 'admin-layout',
            PLATFORM_NAME,
            title: PLATFORM_NAME + " || Admin Dashboard",
            adminData,

            platformUsersCount,
            blockedPlatformUsersCount,
            productsCount,
            getProductCategoriesCount,

            placedOrdersCount,
            shippedOrdersCount,
            deliveredOrdersCount,
            cancelledOrdersCount,

            totalSales,
            todaysSales,

            totalSalesCount,
            todaysSalesCount,

            monthlySalesData,
            paymentAnalytics,

            platformOrdersData

        }

        res.render('admin/admin-home', dataToRender);

    }catch(error){
  
      console.log("Error from adminDashboardGET adminDashboardController: ", error);
  
      res.redirect('/admin/error-page');
  
    }

}



module.exports = {

    adminDashboardGET

}