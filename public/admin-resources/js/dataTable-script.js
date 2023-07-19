// Script for enabling data-tables in various pages

$(document).ready(function(){
    
    $('#active-coupons-table').DataTable();

    $('#deactivated-coupons-table').DataTable();

    $('#admin-dashboard-orders-table').DataTable({

        "order": [[0, "desc"]], // Sort the first column (index 0) in descending order
        "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        "pageLength": 5 // Set the initial page length to 5
        
    });
    
});