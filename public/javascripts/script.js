// JavaScript to make Ajax call for refreshing cart count

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
