var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const bcrypt = require('bcrypt')
require('dotenv').config()
const { ObjectId } = require('mongodb')
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET,
  });


module.exports = {
    doSignup: (userData) => {
        userData.date=new Date()
        userData.address=[]
        userData.isblocked=false
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((userData) => {
                resolve(userData)
            })
        })
    },

    doLogin : (userData)=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            console.log(user);
            if(user){
                
                 if(user.isblocked){
                    reject({error:"user is blocked"})
                 }else{
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                        if(status){
                            resolve(user)
                        }else{
                            reject({error:"password"})
                        }
    
                    })
                    
                 }
                  

            }else{
                reject({error:"Email"})
            }

 })
},

    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let AllUsers = await db.get().collection(collection.USER_COLLECTION).find().sort({date:-1}).toArray()
            resolve(AllUsers)
           
        })
    },
    findByNumber(num) {
        console.log(num);
        return new Promise(async (resolve, reject) => {
          const user = await db.get().collection(collection.USER_COLLECTION).findOne({phone:num});
          if (user) {
            if (user.isblocked) {
              reject({ error: 'This account is block' });
            } else {
              resolve(user);
            }
          } else {
            reject({ error: 'account not found' });
           
     }
     })
      },
      addToCart:(proID,userID)=>{
         
        let proObj={

            item:ObjectId(proID),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            console.log(proObj);
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({users:ObjectId(userID)})

            if(userCart){
              
                let proExist=userCart.products.findIndex(product => product.item==proID)
                 console.log(proExist);

                 if(proExist!=-1){

                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({users:ObjectId(userID),'products.item':ObjectId(proID)},{

                        $inc:{'products.$.quantity':1}
                    }).then(()=>{

                        resolve()
                    }).catch(()=>{

                        reject()
                    })

                 }else{

                 
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({users:ObjectId(userID)},{

                    $push:{products:proObj}

                }).then((respons)=>{

                    resolve()
                }).then(()=>{

                    reject()
                })

            }

            }else{

                let cartObj={

                    users:ObjectId(userID),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((respons)=>{

                    resolve()
                }).catch(()=>{

                    reject()
                })
            }
 })
},
getAllCartProducts:(userID)=>{

    return new Promise(async(resolve,reject)=>{

        let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([

            {
                $match:{users:ObjectId(userID)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{

                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{

                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'products'
                },
                
            },
             {

                $project:{

                    item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                }
             }

        ]).toArray()
        
        resolve(cartItems)
    }).catch(()=>{

        reject()
})
},
getCartTotalAmount:(userID)=>{
      
    return new Promise(async(resolve,reject)=>{
     
     let Total=await db.get().collection(collection.CART_COLLECTION).aggregate([

         {
             $match:{users:ObjectId(userID)}
         },
         {
             $unwind:'$products'
         },
         {
             $project:{

                 item:'$products.item',
                 quantity:'$products.quantity'
             }
         },
         {
             $lookup:{

                 from:collection.PRODUCT_COLLECTION,
                 localField:'item',
                 foreignField:'_id',
                 as:'products'
             },
             
         },
          {

             $project:{

                 item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
             }
          },
          {
             $group:{

                 _id:null,
                  Total:{$sum:{$multiply:[{$toDouble :"$quantity"},{$toDouble:"$products.price"}]}}

             }
          }

     ]).toArray()
      
     
     if (Total.length > 0) {
         resolve(Total[0].Total);
         console.log(Total[0].Total);
         
       } else {
         resolve(0); // or some other appropriate value
       }
       
     
})

},  
changeProductQuantity:(cartDetails)=>{
       
    cartDetails.count=parseInt(cartDetails.count)
     cartDetails.quantity=parseInt(cartDetails.quantity)
   
    return new Promise(async(resolve,reject)=>{
        let stock= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(cartDetails.products)})
        stock=stock.StockCount
        if(stock<(cartDetails.quantity +cartDetails.count)){
            console.log("entered reject");
            return   reject()
        }
        
        if(cartDetails.count==-1 && cartDetails.quantity==1){
            
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:ObjectId(cartDetails.cart)},
            {
                $pull:{products:{item:ObjectId(cartDetails.products)}}
            }
            ).then((response)=>{

                resolve({removeProduct:true})
            }).catch(()=>{

                reject()
            })
        }else{
            console.log(cartDetails);
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:ObjectId(cartDetails.cart),'products.item':ObjectId(cartDetails.products)},{

            $inc:{'products.$.quantity':cartDetails.count}
        }).then((response)=>{

            resolve({status:true})
        }).catch(()=>{

            reject()
        })
    }

    })

},
removeCartItems:(cartdata)=>{
   
   return new Promise((resolve,reject)=>{

    db.get().collection(collection.CART_COLLECTION)
    .updateOne({_id:ObjectId(cartdata.cart)},
    {
        $pull:{products:{item:ObjectId(cartdata.products)}}
    }
    ).then((response)=>{

        resolve(response)
    }).catch(()=>{

        reject()
    })

   })
   

},
getCartTotalAmount:(userID)=>{
  
   return new Promise(async(resolve,reject)=>{
    
    let Total=await db.get().collection(collection.CART_COLLECTION).aggregate([

        {
            $match:{users:ObjectId(userID)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{

                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{

                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'products'
            },
            
        },
         {

            $project:{

                item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
            }
         },
         {
            $set: {
              final: {
                $switch: {
                  branches:
                  [{
                    case: { $and: ['$products.offer', { $ne: ['$products.price', ''] }] },
                    then: '$products.offer',
                  },
                  {
                    case: { $and: ['$products.price', { $ne: ['$products.offer', ''] }] },
                    then: '$products.price',
                  },
                  ],
                  default: '',
                },
              },
            },
          },
         {
            $group:{

                _id:null,
                 Total:{$sum:{$multiply:[{$toDouble :"$quantity"},{$toDouble:"$final"}]}}

            }
         }

    ]).toArray()
     
    
    if (Total.length > 0) {
        resolve(Total[0].Total);
        console.log(Total[0].Total);
        
      } else {
        resolve(0); // or some other appropriate value
      }
      
    
   })

},
PlaceOrdered:(order,products,Total)=>{

    return new Promise((resolve,reject)=>{

      console.log(order,products,Total);
      let status=order.payment_method==='COD'?'placed':'pending'
      let shippingStatus='ordered'
    let d=new Date()
      let orderObj={

         deliveryDetails:{

             fname:order.fname,
             cname:order.cname,
             country:order.country,
             add1:order.add1,
             add2:order.add2,
             town:order.town,
             // country:order.country,
             postcode:order.postcode,
             phone:order.phone,
             email:order.email

         },
         userID:ObjectId(order.userID),
         PaymentMethod:order.payment_method,
         products:products,
         TotalAmount:Total,
         status:status,
         
         btn:true,
         shippingStatus:shippingStatus,
         date:new Date(),
         customdate:d.toDateString()
      }
      console.log(orderObj);
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
         
        //  db.get().collection(collection.CART_COLLECTION).deleteOne({users:ObjectId(order.userID)})
        
           resolve(response.insertedId)
      })
    })
 },
 getproductList:(userID)=>{

  return new Promise(async(resolve,reject)=>{
   

     cart= await db.get().collection(collection.CART_COLLECTION).findOne({users:ObjectId(userID)})
      
     resolve(cart.products)

  }).catch(()=>{

     reject()
  })

 },
 OrderDetails:(userID)=>{

     return new Promise(async(resolve,reject)=>{

        let OrderDetails = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            { $match: { userID: ObjectId(userID) } },
            { $sort: { date: -1 } }
        ]).toArray();
        resolve(OrderDetails)
     })
 },
 OrderCancelled:(orderID,status)=>{

      if(status=='placed'|| status=='pending'){

         status='order cancelled'
      }
      return new Promise((resolve,reject)=>{
       
         db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderID)},{

             $set:{
 
                 status:status
             }
          }).then((response)=>{
 
               resolve(response)
          })

      })
    
 },
 orderProductView:(orderID)=>{
    console.log(orderID);
    return new Promise(async(resolve,reject)=>{

        let singleOrder= await db.get().collection(collection.ORDER_COLLECTION).aggregate([

            {
                $match: {_id:ObjectId(orderID)},
            },
            {
                $project:{

                    products:1,
                    deliveryDetails:1,
                    status:1,
                },
            },
            {
                $unwind:'$products',
            },
            {
                $lookup:{

                    from:'product',
                    localField:'products.item',
                    foreignField:'_id',
                    as:'orders',
                },
            },
            {
               $unwind:'$orders',
            },
            // {
            //     $project:{'orders':1,_id:0}
            // }

          ]).toArray();
         
          console.log(singleOrder);
          resolve(singleOrder)
    })
  },
  passchanging: (userData,user) => {
   console.log(user._id,'>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.aa');
    return new Promise(async (resolve, reject) => {
        userData.password = await bcrypt.hash(userData.password, 10)
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:user._id},{

            $set:{
                password:userData.password,

            },
            
        }).then((userData) => {
            resolve(userData)
        })
    })
},
addAditionalAddress:(address)=>{
    return new Promise((resolve,reject)=>{
        let address1={}
       console.log(address);
       address1.orderAddressId =new ObjectId(),
        address1.userId =address.userId,
        address1.fname =address.fname,
        address1.cname =address.cname,
        address1.phone =address.phone,
        address1.email =address.email,
        address1.address = address.add1,
        address1.country = address.country,
        address1.town = address.town,
        address1.postcode = address.postcode
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(address.userId)},{$push: {address:address1}}).then((response)=>{
            resolve()
        })

    })
},
getUserAddress:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(userId)},{_id:0,address:1}).then((response)=>{
            resolve(response.address)
        });

    })
},
findOrderAddress:(orderAddressId,userId)=>{

    return  new Promise(async(resolve,reject)=>{
        let orderAddress=await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
              '$match': {
                '_id': new ObjectId(userId)
              }
            }, {
              '$unwind': {
                'path': '$address'
              }
            }, {
              '$project': {
                '_id': 0, 
                'address.orderAddressId': 1, 
                'address.fname': 1, 
                'address.cname': 1, 
                'address.address': 1, 
                'address.town': 1, 
                'address.country': 1, 
                'address.phonenumber':1,
                'address.postcode': 1,
                'address.phone': 1, 
                'address.email':1,
              }
            }, {
              '$match': {
                'address.orderAddressId': new ObjectId(orderAddressId)
              }
            }
          ]).toArray()
        console.log(orderAddress,'ghdsdasfht');
           resolve(orderAddress)
})
},    
generateRazorpay:(orderID,Total)=>{
       
    return new Promise((resolve,reject)=>{
       
     var options = {

        amount : Total*100,
        currency: "INR",
        receipt:""+orderID
     };
     instance.orders.create(options, function(err, order){
        if(err){
          console.log(err);
        }
      console.log("new order:",order);
      resolve(order)
     });
        
    })

  },
  verifypayments:(details)=>{
    console.log("+>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
   return new Promise((resolve,reject)=>{

    var crypto = require('crypto');

    var hmac = crypto.createHmac('sha256', 'xslbBw99lI0wSbcbW3c2oUkJ');

    hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
    hmac=hmac.digest('hex')

    if(hmac==details['payment[razorpay_signature]']){

        resolve()
    }else{

        reject()
    }

   })

  },
  changePaymentStatus:(orderID)=>{

  return new Promise((resolve,reject)=>{

  db.get().collection(collection.ORDER_COLLECTION)
  .updateOne({_id:ObjectId(orderID)},

  {
   
    $set:{

        status:'placed'
    }

  }
  
  
  ).then(()=>{

    resolve()
  })

  })


  },
  editAddress: (userDetails) => {
    return new Promise((resolve, reject) => {
        console.log(userDetails.userId, "userDetails,userId")
        db.get().collection(collection.USER_COLLECTION).updateOne({ _id:ObjectId(userDetails.userId) }, {
            $set:
            {
                name: userDetails.name,
                email: userDetails.email,
                phone: userDetails.phone,
                "address.0.address":userDetails.address,
            }
        }).then((response) => {
            console.log('updated')
            resolve(response)
        })
})
},
getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
        let user = db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
        resolve(user)
    })
},
deleteAddress:(addressId,userId)=>{
    return new Promise((resolve,reject)=>{
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>",addressId);
        db.get().collection(collection.USER_COLLECTION).updateOne(
            {"_id": ObjectId(userId)},
            { "$pull": { "address": { "orderAddressId":ObjectId(addressId) } } }
         ).then(()=>{
            resolve()
         })
    })
},
returningOrder: (orderId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, { $set: { status: 'Return Process Started', return: false, returnDate: new Date, productReturning: true, btn: false } }).then(() => {
            resolve()
        })
    })
},
couponManage(C_code, total) {
     C_code = C_code.toUpperCase();
     console.log( C_code);
    return new Promise(async (resolve, reject) => {
      const coupon = await db.get().collection(collection.COUPON_COLLECTION).aggregate([
        {
          $match: {
            $and: [{ code: C_code },
              { limit: { $gte: total } },
              { isoDateStart: { $lte: new Date() } },
              { isoDateEnd: { $gte: new Date() } },
            ],
          },
        },
        {
          $project: {
            _id: null,
            offerAmount: { $subtract: [total, { $divide: [{ $multiply: [total, '$percentage'] }, 100] }] },
          },
        },
  
      ]).toArray();
      console.log(coupon);
      if (coupon.length != 0) {
        
        resolve(coupon[0]?.offerAmount);
      } else {
        console.log(">>>>>>>><<<<<<<<<<<");
        reject();
      }
    });
  },
  getAllCoupons() {
    return new Promise(async (resolve, reject) => {
      const normalCoupons = await db.get().collection(collection.COUPON_COLLECTION).find({ type: 'normal' }).toArray();
      const categoryCoupons = await db.get().collection(collection.COUPON_COLLECTION).find({ type: 'category' }).toArray();
      const productCoupons = await db.get().collection(collection.COUPON_COLLECTION).aggregate([
        {
          $match: { type: 'product' },
        },
        {
          $lookup: {
            from: 'product',
            localField: 'id',
            foreignField: '_id',
            as: 'product',
          },
        },
        {
          $unwind: '$product',
        },
      ]).toArray();
      if (normalCoupons.length != 0 || categoryCoupons.length != 0) {
        resolve({ normalCoupons, categoryCoupons, productCoupons });
      } else {
        reject();
      }
    });
  },
  UserWishlist:(proID,userID)=>{
          
    
    let proObj={

        item:ObjectId(proID),
        
    }
    return new Promise(async(resolve,reject)=>{
            
       

        let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({users:ObjectId(userID)})

        if(wishlist){
          
            let proExist=wishlist.products.findIndex(product => product.item==proID)
             console.log(proExist);

             if(proExist!=-1){

                db.get().collection(collection.WISHLIST_COLLECTION)
                .updateOne({users:ObjectId(userID),'products.item':ObjectId(proID)},{
                     
                   $pull:{products:{item:ObjectId(proID)}}
                   
                }).then(()=>{

                    resolve()
                }).catch(()=>{

                    reject()
                })

             }else{

             
            db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({users:ObjectId(userID)},{

                $push:{products:proObj}

            }).then((respons)=>{

                resolve()
            }).then(()=>{

                reject()
            })

        }

        }else{

            let cartObj={

                users:ObjectId(userID),
                products:[proObj]
            }
            
            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cartObj).then((respons)=>{
                
                resolve()
            }).catch((err)=>{

                reject()
            })
        }
    })



},
getAllWishlist:(userID)=>{

return new Promise(async(resolve,reject)=>{

    let wishlistItem=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([

        {
            $match:{users:ObjectId(userID)}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{

                item:'$products.item',
                // quantity:'$products.quantity'
            }
        },
        {
            $lookup:{

                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'products'
            },
            
        },
         {

            $project:{

                item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
            }
         }

    ]).toArray()
    console.log(wishlistItem);
    resolve(wishlistItem)

}).catch(()=>{

    reject()
})

},
removeWishlistItems:(wishlistData)=>{
   
return new Promise((resolve,reject)=>{


    db.get().collection(collection.WISHLIST_COLLECTION)
    .updateOne({_id:ObjectId(wishlistData.wishlist)},
    {
        $pull:{products:{item:ObjectId(wishlistData.products)}}
    }
    ).then((response)=>{

        resolve(response)
    }).catch(()=>{

        reject()
    })
})
 
},
getSearchProduct(data) {
    console.log(data);
    return new Promise(async (resolve, reject) => {
        // db.get().collection('PRODUCT_COLLECTION').createIndex({ name: "text" })
const book = await db.get().collection(collection.PRODUCT_COLLECTION).find({ $text: { $search: data } }).toArray();
      if (book.length != 0) {
        resolve(book);
      } else {
        reject();
      }
    });
  },
  searchResults: (searchItem) => {
    return new Promise(async (resolve, reject) => {
        let result = await db.get().collection(collection.PRODUCT_COLLECTION).find( {'$or': [
            { brand: { $regex: searchItem, '$options': 'i' } },
            { category: { $regex: searchItem, '$options': 'i' } },
        ]}).toArray()
        console.log(result, 'resultssss');

        if (result.length > 0) {
            console.log('item found.....here is the item');
            resolve(result);

        } else {
            console.log('item not found.....');
            reject()
        }

    })
},
getPriceFilter: (min, max) => {
    console.log(`Filtering products by price between ${min} and ${max}...`);
    let minimum=parseInt(min)
    let maximum=parseInt(max)
    return new Promise(async (resolve, reject) => {
      try {
        const priceFilter = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
          {
            $match: {
              price: { $gte: minimum, $lte: maximum }
            }
          },
        ]).toArray();
        console.log(`Found ${priceFilter.length} products matching filter.`);
        if (priceFilter.length > 0) {
          resolve(priceFilter);
        } else {
          reject(new Error('No products found'));
        }
      } catch (error) {
        console.error('Error filtering products by price:', error);
        reject(new Error('Error filtering products by price'));
      }
    });
  },
  removeCartAfterOrder:(item,userID)=>{

    console.log("this is cart",item);
    
    return new Promise(async(resolve,reject)=>{
    
    for(let i=0;i<item.length;i++){
    
        // item[i].quantity=Number(item[i].quantity)
    
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:item[i].prod},{
    
            $inc:{StockCount:-item[i].quantity}
        })
    
       await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:item[i].prod},[{
    
       $set:{available:{$cond:{if:{$lt:["$StockCount",0]},then:true,else:false}}},  
        
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
    stockIncreamentAfterReturn:(item)=>{

        console.log("this is order",item);
    
        return new Promise(async(resolve,reject)=>{
    
            for(let i=0;i<item.length;i++){
    
                // item[i].quantity=Number(item[i].quantity)
            
                await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:item[i].prod},{
            
                    $inc:{StockCount:+item[i].quantity}
                })
            
               await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:item[i].prod},[{
            
               $set:{available:{$cond:{if:{$gt:["$StockCount",0]},then:true,else:false}}},  
                
               }]).then(()=>{
            
                resolve()
            
               }).catch((error)=>{
            
                reject()
               })
            }
    
    
        })
      },
      orderProductList:(orderID)=>{
        
        console.log(orderID,"))))))))))))))))))))))))))))");
        return new Promise(async(resolve,reject)=>{
          
    
            let order= await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(orderID)})
             
            resolve(order.products)
    
         }).catch(()=>{
    
            reject()
         })
    
      },
}   