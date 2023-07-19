/* 
======================================= COMMON JAVASCRIPT FUNCTIONS =======================================
*/


// JavaScript to make load single product page

function viewProduct(id) {

  window.location.href = '/product-details/' + id;

}



// JavaScript to make Ajax call for refreshing cart count - called from cart page

function addToCart(productId, productName) {

  // console.log(productId);

  $.ajax({

    url: "/add-to-cart/" + productId,

    method: "get",

    success: (response) => {

      if(response.status){
        
        let cartCount = $('#cart-count').attr('data-notify');

        cartCount = parseInt(cartCount) + 1;

        $('#cart-count').attr('data-notify', cartCount);

        swal( productName, "Successfully added to your cart!", "success");

      }

    }

  });

}


// JavaScript to make Ajax call for changing cart quantity - called from cart page

function changeQuantity(cartId, productId, userId, count){

  // console.log('Change Quantity Function Called');
  // The above message will be consoled in the browser console as it is happening at client side

  // For getting the current value in the quantity feild of the product inside cart page
  let productQuantity = parseInt(document.getElementById(productId).innerHTML);

  // For parsing the count received as argument into an integer value
  count = parseInt(count);

  // AJAX Function for updating product quantity in cart page

  $.ajax({

    url:'/change-product-quantity',

    data:{

      userId:userId,

      cart:cartId,

      product:productId,

      count:count,

      quantity:productQuantity

    },

    method:'post',

    success:(response)=>{

      if(response.cartProductRemoved){ // If the quantity of the product was 1 and if it was further decremented using the decrement function, then the product is removed from the cart as the quantity of the product would become zero

        alert("Product removed from cart");

        location.reload(); // Reload the entire page if there is a product removed from the cart - Later have to modify this code and have to update the table alone using Ajax

      }else{ // Increment or decrement the value in the quantity using ajax

        document.getElementById(productId).innerHTML = productQuantity + count;

        document.getElementById('cart-total').innerHTML = response.cartValue;

      }
        
    }

  })

}

// JavaScript to make Ajax call for removing a product from cart - called from cart page

function removeProductFromCart(cartId, productId){

  // console.log('Remove product from cart Function Called');
  // The above message will be consoled in the browser console as it is happening at client side

  // AJAX Function for removing a product from cart

  $.ajax({

    url:'/delete-product-from-cart',

    data:{

      cart:cartId,

      product:productId,


    },

    method:'post',

    success:(response)=>{

      if(response.cartProductRemoved){ // If the quantity of the product was 1 and if it was further decremented using the decrement function, then the product is removed from the cart as the quantity of the product would become zero

        alert("Product removed from cart");

        location.reload(); // Reload the entire page if there is a product removed from the cart - Later have to modify this code and have to update the table alone using Ajax

      }
        
    }

  })

}

/*========================================================================================================================
  ================================================ SCRIPT FOR CHECKOUT PAGE ==============================================
  ======================================================================================================================== */

// JavaScript to make Ajax call for Checkout Button - called by checkout button in place-order page

$(document).ready(function() {

  $('#checkout-button').click(function(e){

    e.preventDefault(); // To prevent default method of submitting form as here Ajax should be used here to submit the form based on the two different payment methods

    // console.log("Checkout Button Ajax call");

    // Check if a payment option is selected
    const paymentOptionSelected = $('input[name="payment-method"]:checked').val();

    if (!paymentOptionSelected) {

      $('#myModal').modal('show'); // Trigger the modal
      
      return;

    }

    $.ajax({
      
      url:'/place-order',

      method:'POST',

      data: $('#checkout-form').serialize(), // Here serialize function is used to get all the data from the form into the data feild of ajax call

      success:(response)=>{

        if(response.COD_CHECKOUT){

          location.href ='/order-success'

        }else if (response.ONLINE_CHECKOUT){ // If user has selected payment as online payment

          makeRazorpayPayment(response);

        }else{

          location.href ='/order-failed'
          // If any of the above payment didn't happen, Should create a failed order page to user and display

        }

      }

    })

  })

  function makeRazorpayPayment(serverOrderData){

    let razorpayKeyId = serverOrderData.razorpayKeyId;

    let orderDetails = serverOrderData.orderDetails;

    let userDetails = serverOrderData.userDetails;

    let userOrderRequestData = serverOrderData.userOrderRequestData;


    let paymentDataToRazorpayServer = {

      "key": razorpayKeyId, // Enter the Key ID generated from the Dashboard
      "amount": orderDetails.amount,
      "currency": "INR",
      "name": "GetMyDeal",
      "description": "Test Transaction",
      "image": "https://alwinsimon.com/wp-content/uploads/2020/04/logo1.png",
      "order_id": orderDetails.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      "handler": function (response){ // This function will receive the server response from Razorpay server as argument on SUCCESFUL payment

        // Sending the response received from RazorPay server after payment to verifyPayment function for matching signature
        // Order details are send via verifyPayment function for using in updateOnlineOrderPaymentStatus function if the signature is succesfully verified
        
        verifyPayment(response,orderDetails);

        storePaymentResponseDataFromGateway(response);

      },
      "prefill": {

        "name": userDetails.name,
        "email": userDetails.email,
        "contact": userOrderRequestData.mobile

      },
      "notes": {

        "Customer Address": userOrderRequestData.address
        
      }

    };

    // Creating a new object of RazorPay and passing the payment data to the object for creating an order at razorpay server by using the predefined functions in Razorpay Module 
    var razorpayPayment = new Razorpay(paymentDataToRazorpayServer);

    razorpayPayment.open(); // Calling the pre-defined function "open" in Razorpay module using the object of Razorpay created above

    // If the payment failed for any reason, calling the pre-defined function "on" in Razorpay module using the object of Razorpay
    razorpayPayment.on('payment.failed', function (response){ // This function will receive the server response from Razorpay server as argument on FAILED payment

      storePaymentResponseDataFromGateway(response);

    });

  }

  function verifyPayment(razorpayServerPaymentResponse, serverOrderDetails){

    // console.log("Verify Payment Ajax Called");

    $.ajax({

      url:'/verify-payment',

      data:{

        razorpayServerPaymentResponse,

        serverOrderDetails
        
      },
      
      method:'POST',

      success:(response)=>{

        if(response.status){

          location.href ='/order-success'

        }else{

          location.href ='/order-failed'

        }

      }

    })

  }

  function storePaymentResponseDataFromGateway(paymentDataFromGateway){
    
    $.ajax({

      url:'/save-payment-data',

      data:paymentDataFromGateway,

      method:'POST'

    })

  }

});

function modifyWishListStatus(productId){

  fetch(
    
    '/modify-wishlist', 
    
    {
      
      method : "POST",

      headers : {'Content-Type': 'application/json'},

      body : JSON.stringify({

        productId : productId

      })

    }

  )
  .then((response)=>{

    if (response.status === 200) {

      response.json().then((data) => {

        if (data.status === "removed") {

          swal("Product removed from your wishlist!", "success");

        } else if (data.status === "added") {

          swal("Product successfully added to your wishlist!", "success");

        } else {

          console.error('Error in modifyWishListStatus Function');

        }

      });

    } else {

      console.error('Error in modifyWishListStatus Function');

    }

  })
  .catch((error) => {

    console.error('Error in modifyWishListStatus Function:', error);
    /* This will be displayed on browser Console */

  }); 

}

 
function modifyWishListFromWishlistPage(productId){
  
  /* Using a seperate function for the same purpose of modifying wishlist exactly same as the modifyWishListStatus because, 
   in wishlist page the page has to be reloded after making the change 
  */
 
  fetch(
    
    '/modify-wishlist', 
    
    {
      
      method : "POST",

      headers : {'Content-Type': 'application/json'},

      body : JSON.stringify({

        productId : productId

      })

    }

  )
  .then((response)=>{

    if (response.status === 200) {

      response.json().then((data) => {

        if (data.status === "removed") {

          swal("Product removed from your wishlist!", "success");

          location.reload();

        } else if (data.status === "added") {

          swal("Product successfully added to your wishlist!", "success");

          location.reload();

        } else {

          console.error('Error in modifyWishListStatus Function');

        }

      });

    } else {

      console.error('Error in modifyWishListStatus Function');

    }

  })
  .catch((error) => {

    console.error('Error in modifyWishListStatus Function:', error);
    /* This will be displayed on browser Console */

  }); 

}