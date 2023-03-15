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
 