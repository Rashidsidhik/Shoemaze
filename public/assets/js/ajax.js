function deleteCoupon(id){
    console.log("called",id);
    $.ajax({
      url:'/admin/deletecoupon',
      data:{
        id:id
      },
      method:'post',
      success:(response => {
        location.reload()
      })
    })
  }
  function deleteproduct(id){
    console.log("called",id);
    $.ajax({
      url:'/admin/delete-product',
      data:{
        id:id
      },
      method:'post',
      success:(response => {
        location.reload()
      })
    })
  }
  function deletecategory(id){
    console.log("called",id);
    $.ajax({
      url:'/admin/deleteCategory',
      data:{
        id:id
      },
      method:'post',
      success:(response => {
        location.reload()
      })
    })
  }
 