removeCartAfterOrder:(item,userID)=>{

    console.log("this is cart",item);
    
    return new Promise(async(resolve,reject)=>{
    
    for(let i=0;i<item.length;i++){
    
        // item[i].quantity=Number(item[i].quantity)
    
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:item[i].prod},{
    
            $inc:{StockCount:-item[i].quantity}
        })
    
       await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:item[i].prod},[{
    
       $set:{productstock:{$cond:{if:{$lt:["$StockCount",1]},then:false,else:true}}},  
        
       }]).then(()=>{
    
        db.get().collection(collection.CART_COLLECTION).deleteOne({users:ObjectId(userID)})
    
        console.log("delte cart");
    
        resolve()
    
       }).catch((error)=>{
    
        reject()
       })
    }
    
    })
    },
    PlaceOrdered(req.body,products,finalPrice).then((orderID)=>{
         
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
       
        if(req.body.payment_method=='COD'){
  
          let ids = destruct(products)
          console.log(ids,"ids");
    
          console.log(`this is the idss :: ${ids}`);
          removeCartAfterOrder(ids,req.body.userID)
          .then(()=>{
           
            res.json({codSuccess:true})
  
          }).catch(()=>{
            console.log("error occured while removing from cart after order");
          })
         
        
        }
      
        else if(req.body.payment_method=='ONLINE'){
  
          generateRazorpay(orderID,Total).then((response)=>{
              
            let ids  = destruct(products)
  
            removeCartAfterOrder(ids,req.body.userID).then(()=>{
              
              response.razorPay=true
              res.json(response)
  
            })
  
           
  
          })
        }else if(req.body.payment_method=='Paypal'){
          
          // const Total = Math.floor(finalPrice/85)
         console.log(usdtotal,"}}}}}}}}}}}}}}}}}}}}}}}}}}");
          var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "https://sneakerspot.live/order/OrderDetails",
                "cancel_url": "https://Gota.gq/paymentError"
            },
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total":  usdtotal
                },
                "description": "this is order"
            }]
        };
      
        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
            console.log(error.response, 'paypal errorrr');
            throw error;
            
  
          } else {
            for (var index = 0; index < payment.links.length; index++) {
             console.log('paymenttttttttttttttttttttttttt');
  
              if (payment.links[index].rel === 'approval_url') {
               console.log('successssssssssssssssssssssssssss');
                console.log(payment.links[index]);
                // res.json({  url: payment.links[index].href,status:"payPal" });
                var forwardLink = payment.links[index].href;
          var response = { forwardLink: forwardLink };
          res.json(response); // send JSON response back to client
  
  
  
  
  
  
              //  response.paypal=true;
                // res.json({  forwardLink: payment.links[index].href ,response});
              }
            }
            // console.log(payment);
          }
        });
              changePaymentStatus(orderID).then(()=>{
  
                let ids = destruct(products)
  
                removeCartAfterOrder(ids,req.body.userID).then(()=>{
  
              })
  
            })
     
      
  
              
    }else if(req.body.payment_method=='Wallet'){
  
      let ids = destruct(products)
   
     changeWalletAmount(req.body.userID,finalPrice)
     .then(()=>{
            
      removeCartAfterOrder(ids,req.body.userID)
      .then(()=>{
  
        res.json({Wallet:true})
  
    })
    .catch(()=>{
  console.log("))))))))))))))))))))");
      const error = "Sufficient balance for WalletAmount";
      res.status(400).json({ error: error }); // send 400 Bad Request with custom error message
    })
          })
  
  
        }
  
       
  
      })
  
        })
  
  
  
      })
    
    },