$("#addAddress").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/addSecondaryAddress',
        method:'post',
        data:$('#addAddress').serialize(),
        success:((res)=>{
            if(res){
               location.href = '/'
            }
            else{
                Swal.fire({
                    title: 'PASSWORD DO NOT MATCH!!!',
                    text: 'Please Check Your Password',
                    icon: 'error',
                    confirmButtonText: 'back'
                  })

            }
        })
    })
 })

 $("#addNewAddress").submit((e)=>{
   console.log('tfytfyufgyugfygfgy');
  e.preventDefault()
    $.ajax({
        url:'/addAditionalAddress',
        method:'post',
        data:$('#addNewAddress').serialize(),
        success:(()=>{
            location.reload()
        })
    })
 })



 function makeAddressDefault(addressId){
    $.ajax({
      url:'/makeAddressDefault/'+addressId,
      method:'get',
      success:(response)=>{
        if(response){
          location.reload()
        }
      }
    })
  }
  
  function deleteAddress(addressId){
    $.ajax({
      url:'/deleteAddress/'+addressId,
      method:'delete',
      success:(response)=>{
        if(response){
          location.reload()
        }
      }
    })
  }
  function orderShippede(orderId){
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    $.ajax({
      url:'/admin/shipped-order/'+orderId,
      method:'get',
      success:(response)=>{
        if(response){
          location.reload()
        }
      }
    })
  }
  function orderDelivered(orderId){
  
    $.ajax({
      url:'/admin/delivered-order/'+orderId,
      method:'get',
      success:(response)=>{
        if(response){
          location.reload()
        }
      }
    })
  }
  function removeCartProduct(cartID,proID,count,quantity) {
    const DNDALERT = new DNDAlert({
      title: 'Alert',
      message:
          'Are you sure want to remove this product',
      type: 'info',
      html: false,
      buttons: [
        {
          text: 'Yes',
          type: 'primary',
          onClick: () => {
            finalProduct(cartID, proID, count, quantity)
          },
        },
        {
          text: 'Close',
          onClick: (bag) => {
            bag.CLOSE_MODAL();
          },
        },
      ],
      closeBackgroundClick: true,
      portalElement: document.querySelector('body'),
      portalOverflowHidden: true,
      textAlign: 'center',
      theme: 'white',
      onOpen: (bag) => {
        console.log('Modal Opened');
        console.log(bag.PROPERTIES);
      },
      onClose: (bag) => {
        console.log('Modal Closed');
        console.log(bag);
      },
      opacity: 1,
      autoCloseDuration: 15000,
      draggable: true,
      animationStatus: true,
      closeIcon: false,
      sourceControlWarning: true,
  
    });
  }
  function cartAlert() {
    const DNDALERT = new DNDAlert({
      title: 'Alert',
      message:
          'One Item Added to Cart',
      type: 'success',
      html: false,
      
      closeBackgroundClick: true,
      portalElement: document.querySelector('body'),
      portalOverflowHidden: true,
      textAlign: 'center',
      theme: 'white',
      onOpen: (bag) => {
        console.log('Modal Opened');
        console.log(bag.PROPERTIES);
      },
      onClose: (bag) => {
        console.log('Modal Closed');
        console.log(bag);
      },
      opacity: 1,
      autoCloseDuration: 1000,
      draggable: true,
      animationStatus: true,
      closeIcon: false,
      sourceControlWarning: true,
  
    });
  }
  function finalProduct(cartID,proID,count,quantit){
          
    let quantity=parseInt(document.getElementById(proID).innerHTML)
   
    count=parseInt(count)
       $.ajax({
        
        url:'/change-product-quantity',
        data:{
            cart:cartID,
            products:proID,
            count:count,
            quantity:quantity,
          
            
        },
        method:'post',
        success:(response)=>{
          
            if(response.removeProduct){

                
                location.reload()
            }
            // alert(response)
        }
        
       })
}
function wishlistAlert() {
  const DNDALERT = new DNDAlert({
    title: 'Alert',
    message:
        'One Item Added to WISHLIST',
    type: 'success',
    html: false,
    
    closeBackgroundClick: true,
    portalElement: document.querySelector('body'),
    portalOverflowHidden: true,
    textAlign: 'center',
    theme: 'white',
    onOpen: (bag) => {
      console.log('Modal Opened');
      console.log(bag.PROPERTIES);
    },
    onClose: (bag) => {
      console.log('Modal Closed');
      console.log(bag);
    },
    opacity: 1,
    autoCloseDuration: 1000,
    draggable: true,
    animationStatus: true,
    closeIcon: false,
    sourceControlWarning: true,

  });
}
  function wishlistremoveAlert() {
    const DNDALERT = new DNDAlert({
      title: 'Alert',
      message:
          'One Item removed From WISHLIST',
      type: 'success',
      html: false,
      
      closeBackgroundClick: true,
      portalElement: document.querySelector('body'),
      portalOverflowHidden: true,
      textAlign: 'center',
      theme: 'white',
      onOpen: (bag) => {
        console.log('Modal Opened');
        console.log(bag.PROPERTIES);
      },
      onClose: (bag) => {
        console.log('Modal Closed');
        console.log(bag);
      },
      opacity: 1,
      autoCloseDuration: 1000,
      draggable: true,
      animationStatus: true,
      closeIcon: false,
      sourceControlWarning: true,
  
    });
  
}
