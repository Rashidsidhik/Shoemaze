const { doSignup, doLogin,findByNumber,addToCart,getAllCartProducts,getCartTotalAmount,changeProductQuantity,removeCartItems,getproductList,PlaceOrdered,generateRazorpay,OrderDetails,verifypayments,changePaymentStatus,OrderCancelled,orderProductView,passchanging, addAditionalAddress,getUserAddress,findOrderAddress,editAddress,getUserDetails,deleteAddress,returningOrder,couponManage,getAllCoupons,UserWishlist,getAllWishlist,removeWishlistItems,getSearchProduct,searchResults,getPriceFilter,removeCartAfterOrder,orderProductList,stockIncreamentAfterReturn} = require("../model/user-helpers")
var productHelpers = require('../model/product-helpers')
const{getTotalPrice} =require('../utils/getcart')
require('dotenv').config()
var paypal = require('paypal-rest-sdk');
const client = require("twilio")(process.env.YOUR_ACCOUNT_SID, process.env.YOUR_AUTH_TOKEN);
var otpuser;
const Swal = require('sweetalert2')
const paypalcilent=process.env.PAYPAL_CLIENT_ID;
const paypalsecret=process.env.PAYPAL_SECRET_ID;
paypal.configure({
  'mode': 'sandbox',
  'client_id':paypalcilent ,
  'client_secret':paypalsecret
});


module.exports = {



    loginPage(req, res) {
        res.render('user/login')
    },


    homePage(req, res) {
        let usere=req.session.users
        productHelpers.getAllcategory().then((getcategory)=>{
        productHelpers.getAllProducts().then((products)=>{
        if(req.session.users)
        {
            
            res.render('user/homepage', { user: true,logged: true ,usere,products,getcategory})
        }
        else
        {
            res.render('user/landingpage', { user: true,logged: false,usere,products,getcategory})
        }
    })
  })
    },


    userSignup(req, res) {
        doSignup(req.body).then((userData) => {
            req.session.loggedIn = true;
            req.session.users = userData;
        })

        res.render('user/homepage', { user: true })

    },


    loginAction(req, res) {

        doLogin(req.body).then((user) => {

            req.session.loggedIn = true;
            req.session.users = user;

            res.redirect('/')
        }).catch((error) => {
            res.render('user/login', { error: error.error })
        })
    },

    
        userlogout(req, res) {
            console.log("eFQweatgaeEWYGUYGYTDTRDYTGWD");
            req.session.users=null;
            req.session.loggedIn=false;
            res.redirect('/')
          },
    

    viewProducts(req, res) {
        console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        let usere=req.session.users
        productHelpers.getAllcategory().then((getcategory)=>{
        productHelpers.getAllProducts().then((products)=>{
            console.log("//////////////////////////////////////////////////////////////");
            res.render('user/view-products', {user:true , products,usere,getcategory});
        })
      })
    },
    async singleproduct(req, res) {
        console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        let usere=req.session.users
        let product=await productHelpers.getproductDetails(req.params.id)
            console.log("//////////////////////////////////////////////////////////////");
            res.render('user/productsingle', {user:true ,usere, product});
        
    },
    otplogin(req, res) {
        res.render('user/otplogin', { user: true })
    },
    otpverify(req, res) {
        number = req.body.phone;
       console.log(number,"<<<<<<<<>>>>>>>>>>>>");
  if (number.substring(0, 3) !== '+91') {
    number = `${number}`;
  }
  // accound finding
  findByNumber(number).then((user) => {
    

    
   otpuser=user;
    
    console.log(user, '>>>>', process.env.SERVICE_ID, '>>>>', number);
    client.verify
      .services(process.env.SERVICE_ID)
      .verifications.create({
        to: '+91'+number,
        channel: 'sms',
      })
      .then(() => {
        res.render('user/otpverify', {user:true,number});
      })
      .catch((err) => {
        console.log();
      });
  })
    .catch((error) => {
        console.log(error);
      res.render('user/otplogin', {error:error.error,user:true});
})
},
verifyotp(req, res) {
    console.log(req.body.otp);
    client.verify
      .services(process.env.SERVICE_ID)
      .verificationChecks.create({
        to: `+91${number}`,
        code: req.body.otp,
      }).then(async (data) => {
        console.log(data);
        if (data.status === 'approved') {
            req.session.loggedIn = true;
            req.session.users = otpuser;
          res.redirect('/');
        } else {
          console.log('OTP not matched');
          res.render('user/otpverify', { user:true,error: 'invalid OTP' });
   }
  });
  },
  cartPage(req,res){

    let usere=req.session.users
     let products=getAllCartProducts(req.session.users._id).then((products)=>{
           
       console.log("a}}}}}}}}}}}}}}}}}}}}}}}}}");
       
       getCartTotalAmount(req.session.users._id).then((Total)=>{
       console.log(products);
       if(products.length!=0){
         console.log(products,"{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}");
 
         res.render('user/cart',{user:true,products,usere,Total})
       }else{
          
         res.render('user/cart',{user:true,usere})
         
       }
       
 
       
     }).catch(()=>{
 
     })  
 
     }).catch(()=>{
 
     })
},
addtocart(req, res) { 
  console.log(req.params.id,"fearqe");
  addToCart(req.params.id,req.session.users._id).then((response)=>{
    console.log(response,">>>>>>><<<");
    res.json({response,status:true})
    // res.redirect('/viewlistProducts')
})
},
changequantity(req,res,next){

  console.log(req.body);
  
changeProductQuantity(req.body).then(async(response)=>{
  response.Total= await getCartTotalAmount(req.session.users._id)
// console.log(response.Total,'>>>>>>>>>>>>>>>>>>>>>');
res.json(response)
//  res.redirect('/CartPage')

}).catch(()=>{
  const error = "Stock limit Exceeded";
      res.status(400).json({ error: error }); // send 400 Bad Request with custom error message

})
},
removeCartItem(req,res,next){
console.log(req.body);


removeCartItems(req.body,req.session.users._id).then((response)=>{

res.json(response)

}).catch(()=>{


})
},
proceedToCheckout:(req,res)=>{

  let usere=req.session.users;
console.log(usere,">>>>>>>>>>>>>>>>>>>")
    getCartTotalAmount(req.session.users._id).then(async (Total)=>{
         
      let address = await getUserAddress(usere._id)
      let products=getAllCartProducts(req.session.users._id).then((products)=>{
      res.render('user/proceedToCheckout',{user:true,usere,Total,products,address})
      
    })
      }).catch((error)=>{
       

      })
 
  

},
placeOrder(req,res){
 
  console.log("**************************************************************");
  let users=req.session.users
  console.log(req.body);
  getproductList(req.body.userID).then((products)=>{

    getCartTotalAmount(req.body.userID).then((totalamount)=>{
      if (req.body.offerPrice == '') {
        Total = totalamount;
      } else {
        Total = parseInt(req.body.offerPrice);
      }
  PlaceOrdered(req.body,products,Total).then((orderID)=>{
    function destruct(products) { 
      let data =[]
      for(let i=0;i<products.length;i++){
        let obj ={}  
        obj.prod= products[i].item
        obj.quantity= products[i].quantity
        data.push(obj)
      }
      return data
    }
    let order=orderID
    if(req.body.payment_method=='COD'){
      let ids = destruct(products)
      console.log(ids,"ids");

      console.log(`this is the idss :: ${ids}`);
      removeCartAfterOrder(ids,req.body.userID)
      res.json({codSuccess:true})
    }else if(req.body.payment_method=='RAZORPAY'){

      generateRazorpay(orderID,Total).then((response)=>{
        console.log(response,">>>>>>>>");
        let ids = destruct(products)
        removeCartAfterOrder(ids,req.body.userID)
        res.json({status:"razorpay",response})

      })
    }else if(req.body.payment_method=='PAYPAL'){
      var create_payment_json = {
        "intent": "authorize",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "https://walk-in-style.site/orderDetails",
          "cancel_url": "http://cancel.url"
        },
        "transactions": [{
          
          "amount": {
            "currency": "USD",
            "total": Total
          },
          "description": "This is the payment description."
        }]
      };
      


      paypal.payment.create(create_payment_json, function (error, payment) {
        console.log(create_payment_json);
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          for (var index = 0; index < payment.links.length; index++) {
            //Redirect user to this endpoint for redirect url
            if (payment.links[index].rel === 'approval_url') {
              console.log(payment.links[index].href);
              // res.redirect(payment.links[index].href);
              res.json({status:"paypal",forwardLink: payment.links[index].href});

            }
          }
          console.log(payment);
        }
      });
      console.log(order,"???????????????????????????????????????????");
      changePaymentStatus(order).then(()=>{
        let ids = destruct(products)
  
        removeCartAfterOrder(ids,req.body.userID).then(()=>{

      })
      })
    }

   

  })

    })



  })

},
paypalSucces: (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": Total
      }
    }]
  }
  
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.redirect('/OrderDetails');
    }
  })


},
verifypayment(req,res){
 
  console.log(req.body);
  
  verifypayments(req.body).then(()=>{
 
   changePaymentStatus(req.body['order[receipt]']).then(()=>{
     
     console.log("payment successfully");

     res.json({status:true})

   })
   
  }).catch((err)=>{
   
   res.json({status:false})

  })

 },

orderDetails(req,res){
       
  let usere=req.session.users
    res.render('user/orderplacedsuccess',{user:true,usere})
},
userOrderView(req,res){
  

  let usere=req.session.users
  OrderDetails(req.session.users._id).then((OrderDetails)=>{

    res.render('user/userOrderView',{user:true,OrderDetails,usere})
  })
 
  

},
OrderCancel(req,res){

  OrderCancelled(req.params.id,req.body.status).then(()=>{
    orderProductList(req.params.id).then((products)=>{

      console.log(products,"products coming");

      function destruct(products) { 
        let data =[]
        for(let i=0;i<products.length;i++){
          let obj ={}  
          obj.prod= products[i].item
          obj.quantity= products[i].quantity
          data.push(obj)
        }
        return data
      }
      let ids = destruct(products)
      console.log(ids,"ids");

    stockIncreamentAfterReturn(ids).then(()=>{
         res.redirect('/vieworder')
  })
})
})
},
userProductView(req,res){
       
  let usere=req.session.users
    orderProductView(req.params.id).then((singleOrder)=>{

        res.render('user/orderviewProducts',{user:true,singleOrder,usere})
    })
},
forgotpassword(req, res) {
  res.render('user/forgetpassword',{user:true})
},
forgotverify(req, res) {
  number = req.body.phone;
 
if (number.substring(0, 3) !== '+91') {
number = `${number}`;
}
// accound finding
findByNumber(number).then((user) => {

otpuser=user;

console.log(user, '>>>>', process.env.SERVICE_ID, '>>>>', number);
client.verify
.services(process.env.SERVICE_ID)
.verifications.create({
  to: '+91'+number,
  channel: 'sms',
})
.then(() => {
  res.render('user/forgotverify', {user:true});
})
.catch((err) => {
  console.log();
});
})
.catch((error) => {
  console.log(error);
res.render('user/forgetpassword', {error:error.error,user:true});
})
},
successotp(req, res) {
  console.log(req.body.otp);
  client.verify
    .services(process.env.SERVICE_ID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: req.body.otp,
    }).then(async (data) => {
      console.log(data,'ok rashid');
      if (data.status === 'approved') {
          req.session.loggedIn = true;
          req.session.users = otpuser;
          
        res.redirect('/passwordchange');
      } else {
        console.log('OTP not matched');
        res.render('user/forgotverify', { user:true,error: 'invalid OTP' });
 }
});
},
passwordchange(req, res) {
  res.render('user/passwordchang',{user:true})
},
passwordchanged(req, res) {
  passchanging(req.body,otpuser).then((userData) => {
    
  })
  res.redirect('/')
  

},
saveaddress(req, res){
 console.log(req.body);
  addAditionalAddress(req.body).then((userData) => {
       
    })

    res.redirect('/')

},
addadressform(req, res) {
  let usere=req.session.users
  console.log(usere);
  res.render('user/addaddress',{user:true,usere})
},
makeDefaultAddress:(req,res)=>{
  let usere=req.session.users
  findOrderAddress(req.params.id,usere._id).then((orderAddress)=>{
      res.json(orderAddress)
  })
},
// userprofile(req, res){
//   let usere=req.session.users
  
//   res.render('user/userprofile',{user:true,usere})
// },
userprofile: async (req, res) => {
  let usere = await getUserDetails(req.session.users._id)
  
  res.render('user/userprofile', { user: true, usere})
},
editprofile: async (req, res) => {
  let usere = await getUserDetails(req.session.users._id)
  
  res.render('user/editprofile', { user: true, usere})
},
usereditprofile:(req, res) => {
  let usere=req.session.users
  editAddress(req.body).then((response) => {
    //when we using ajax we only doing passing data in the json format
    console.log(response, "response of update")
    res.json(response)
})

},
userOrderAddress: async (req, res) => {
 
  let usere = await getUserDetails(req.session.users._id)
  console.log(usere);
  res.render('user/orderaddress',{user:true,usere})

},
deleteAddress:(req,res)=>{
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>",req.params.id);
  deleteAddress(req.params.id,req.session.users._id).then(()=>{
    res.redirect('/userprofile')
  })
},
mailpassotp(req, res) {
  res.render('user/mailpassword', { user: true })
},
mailverifyotp(req, res) {
  number = req.body.phone;
 
if (number.substring(0, 3) !== '+91') {
number = `${number}`;
}
// accound finding
findByNumber(number).then((user) => {

otpuser=user;

console.log(user, '>>>>', process.env.SERVICE_ID, '>>>>', number);
client.verify
.services(process.env.SERVICE_ID)
.verifications.create({
  to: '+91'+number,
  channel: 'sms',
})
.then(() => {
  res.render('user/mailverify', {user:true});
})
.catch((err) => {
  console.log();
});
})
.catch((error) => {
  console.log(error);
res.render('user/mailpassword', {error:error.error,user:true});
})
},
submitverifyotp(req, res) {
console.log(req.body.otp);
client.verify
.services(process.env.SERVICE_ID)
.verificationChecks.create({
  to: `+91${number}`,
  code: req.body.otp,
}).then(async (data) => {
  
  if (data.status === 'approved') {
      req.session.loggedIn = true;
      req.session.users = otpuser;
    res.redirect('/editprofile');
  } else {
    console.log('OTP not matched');
    res.render('user/mailverify', { user:true,error: 'invalid OTP' });
}
});
},
returnOrder: (req, res) => {
  returningOrder(req.params.id).then(() => {
    let usere=req.session.users
    OrderDetails(req.session.users._id).then((OrderDetails)=>{
      orderProductList(req.params.id).then((products)=>{

        console.log(products,"products coming");
  
        function destruct(products) { 
          let data =[]
          for(let i=0;i<products.length;i++){
            let obj ={}  
            obj.prod= products[i].item
            obj.quantity= products[i].quantity
            data.push(obj)
          }
          return data
        }
        let ids = destruct(products)
        console.log(ids,"ids");

      stockIncreamentAfterReturn(ids).then(()=>{
      res.render('user/userOrderView',{user:true,OrderDetails,usere})
    })
  })
})
  })
},
getOffers(req, res) {
  if (req.session.users) {
    let usere=req.session.users
    getAllCoupons().then((offers) => {
      res.render('user/offers', { user:true,usere, offers, page: 'OFFERS' });
    }).catch(() => {
      res.render('user/offers', { user:true,usere, page: 'OFFERS' });
    });
  } else {
    getAllCoupons().then((offers) => {
      res.render('user/offers', {
        user: 'Login', guest: true, offers, page: 'OFFERS',
      });
    }).catch(() => {
      res.render('user/offers', { user: 'Login', guest: true, page: 'OFFERS' });
    });
  }
},
async checkCoupon(req, res) {
  const total = await getTotalPrice(req);
  couponManage(req.body.data, total).then((offerPrice) => {
    res.json({ offerPrice, status: true });
  }).catch((err) => {
    res.json({ status: false });
  });
},
categoryfilter(req,res){

  let users=req.session.user
  let name=req.body;

  console.log(users);
  console.log(name);

  productHelpers.filterByCategory(name).then((products)=>{
    console.log(">>>>>>>>>>",products);
    productHelpers.getAllcategory().then((getcategory)=>{
    
      res.render('user/view-products',{user:true,products,users,getcategory})


    }).catch(()=>{

      res.render('user/view-products',{user:true,products,users,getcategory})
    })
   
  })
},
AddToWishlist(req,res){
  console.log(req.params.id,req.session.users._id);
    usere=req.session.users
   console.log("{{{{{");
   UserWishlist(req.params.id,req.session.users._id).then((response)=>{

     res.json({status:true})

   }).catch(()=>{


   })

 },
 wishlistPage(req,res){
    
   let usere=req.session.users

   getAllWishlist(req.session.users._id).then((products)=>{
       
     res.render('user/wishlist',{user:true,products,usere})

   })

 },
 removeWishlistItem(req,res){
   
   console.log(req.body);

   removeWishlistItems(req.body).then((response)=>{

        res.json(response)

   }).catch(()=>{


   })
      
 },
 search(req, res) {
 
  getSearchProduct(req.body.data).then((books) => {
    res.json(books);
  }).catch(() => {
    console.log('search product not found');
    res.json(false);
  });
},
searchProducts: async (req, res) => {
  let search = req.query.search;
  console.log(search, 'searchhhhhh');
  let usere=req.session.users
  await searchResults(search).then((products) => {
    res.render('user/view-products', { user:true,products,usere})

  }).catch(() => {

    let err = 'not found'

    res.render('user/view-products', { user:true,users})
  })

},
async priceFilter(req, res) {
  console.log(req.body,"<<<<<<<<<<<<<<<<<<<<");
  let usere = req.session.users

  await getPriceFilter(req.body.minprice, req.body.maxprice).then((products) => {
    res.render('user/view-products', { user:true,products,usere})

  }).catch(() => {

    let err = 'not found'

    res.render('user/view-products', { user:true,usere})
  })
},
}