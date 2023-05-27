// JavaScript to make Ajax call for refreshing cart count - called from cart page

function addToCart(productId) {

  // console.log(productId);

  $.ajax({

    url: "/add-to-cart/" + productId,

    method: "get",

    success: (response) => {

      if(response.status){

        let cartCount = $('#cart-count').html();

        cartCount = parseInt(cartCount) + 1;

        $('#cart-count').html(cartCount);

      }

    }

  });

}


// JavaScript to make Ajax call for changing cart quantity - called from cart page

function changeQuantity(cartId, productId, userId, count){

  // console.log(userId);
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