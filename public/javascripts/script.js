// JavaScript to make Ajax call for refreshing cart count - called from cart page

function addToCart(productId) {

  console.log(productId);

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

function changeQuantity(cartId, productId, count){

  // console.log('Change Quantity Function Called');
  // The above message will be consoled in the browser console as it is happening at client side 

  $.ajax({

    url:'/change-product-quantity',

    data:{

      cart:cartId,

      product:productId,

      count:count

    },

    method:'post',

    success:(response)=>{

      alert(response);
        
    }

  })

}