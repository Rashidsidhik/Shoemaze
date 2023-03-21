var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports={
    doadminLoged: (adminData) => {

        return new Promise(async (resolve,reject)=>{
            let loginStatus=false;
            let response={}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})

            if(admin){

                bcrypt.compare(adminData.password,admin.password).then((status)=>{
                   
                    if(status){
                        response.admin=admin
                        response.status=true
                        resolve(response);
                    }else{
                        console.log('Login failed');
                        reject({status:false})
                    }
                }).catch(()=>{
                    reject(error)
                })
            }else{
                console.log('Login failed');
                    reject({status:false})
            }
        })
      },

      //------------------------------to block a user-------------------------------------
    blockUser: (blockUserId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(blockUserId) },
                {
                    $set: { isblocked: true }
                })
        }).then((response) => {
            resolve()
        })
    },
    //-----------------------------To unblock a user----------------------------------
    unblockUser: (unblockUserId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(unblockUserId) },
                {
                    $set: { isblocked: false }
                })
        }).then((response) => {
            resolve()
        })
    },
    OrderDetails:()=>{

        return new Promise(async(resolve,reject)=>{
   console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
           let OrderDetails= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $lookup: {
                from: 'user',
                localField: 'userID',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: '$user',
            },
            {
              $project: {
                'user.name': 1,deliveryDetails: 1, btn:1, products: 1, TotalAmount: 1,PaymentMethod: 1, date: 1, status: 1, shippingStatus: 1,
              },
            },
            {
              $sort: { date: -1 } // Sort by date in descending order
            }
          ]).toArray();
          if (OrderDetails.length == 0) {
            reject();
          } else {
            resolve(OrderDetails);
          }
        });
     
    },
    OrderCancelled:(orderID,status)=>{
   
         if(status=='placed'|| status=='pending'){
   
          status='order cancelled'
           
         }
         return new Promise((resolve,reject)=>{
          
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderID)},{
   
                $set:{
                    
                    status:'order cancelled',
                    btn:false,
                }
             }).then((response)=>{
    
                  resolve(response)
             })
   
         })
       
    },
    viewSingleOrder:(orderID)=>{
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

     orderShipped: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'shipped', } },
                ])
                .then((response) => {

                    resolve({ status: true });
                });
        });
    },  
    orderdelivered: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: ObjectId(orderId) }, [
                    { $set: { status: 'Delivered',return:true,btn:false } },
                ])
                .then((response) => {

                    resolve({ status: true });
                });
        });
    },  
    getSalesReport() {
        return new Promise(async (resolve, reject) => {
          const report = await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { 'status': 'Delivered' },
              },
      
              {
                $lookup: {
                  from: 'product',
                  localField: 'products.item',
                  foreignField: '_id',
                  as: 'products',
                },
              },
              {
                $unwind: '$products',
              },
              {
                $project: {
                  deliveryDetails: 1,TotalAmount: 1,PaymentMethod: 1, date: 1, products: 1,customdate:1
                },
              },
            ]).toArray();
          console.log('>>>>>>>>>>', report);
          resolve(report);
        });
      },
      // filterSale(startDate, endDate) {
      //   return new Promise(async (resolve, reject) => {
      //     const sales = await db.get().collection(collection.ORDER_COLLECTION)
      //       .find({ $and: [{ 'status': 'Delivered' }, { date: { $lte: new Date(endDate) } }, {date: { $gte: new Date(startDate) } }] }).toArray();
      //     if (sales.length != 0) {
      //       resolve(sales);
      //     } else {
      //       reject();
      //     }
      //   });
      // }, 
      filterSale(startDate, endDate) {
        return new Promise(async (resolve, reject) => {
          try {
            const report = await db.get().collection(collection.ORDER_COLLECTION)
              .aggregate([
                {
                  $match: {
                    'status': 'Delivered',
                    'date': { $gte: new Date(startDate), $lte: new Date(endDate) }
                  },
                },
                {
                  $lookup: {
                    from: 'product',
                    localField: 'products.item',
                    foreignField: '_id',
                    as: 'products',
                  },
                },
                {
                  $unwind: '$products',
                },
                {
                  $project: {
                    deliveryDetails: 1,
                    TotalAmount: 1,
                    PaymentMethod: 1,
                    date: 1,
                    products: 1,
                    customdate: 1
                  },
                },
              ]).toArray();
            resolve(report);
          } catch (error) {
            reject(error);
          }
        });
      },
      // totalusers() {
      //   return new Promise(async (resolve, reject) => {
      //     const users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
      //     resolve(users);
      //     console.log(users);
      //   });
      // },
      //  getDailyOrder() {
      //   const currentDate = new Date();
      //   return new Promise(async (resolve, reject) => {
      //     const order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      //       {
      //         $match: { date: new Date().toDateString() },
      //       },
      //     ]).toArray();
      //     resolve(order);
      //   });
      // },
      // weeklyOrders() {
      //   return new Promise(async (resolve, reject) => {
      //     const orders = await db.get().collection(collection.ORDER_COLLECTION)
      //       .find({
      //         $and: [
      //           { date: { $lte: new Date() } },
      //           { date: { $gte: new Date(new Date().getDate() - 7) } },
      //         ],
      //       }).toArray();
      //     resolve(orders);
      //   });
      // },
      //  yearlyOrders() {
      //   return new Promise(async (resolve, reject) => {
      //     const orders = await db.get().collection(collection.ORDER_COLLECTION)
      //       .find({
      //         date: { $gte: new Date(new Date().getFullYear - 1) },
      //       }).toArray();
      //     resolve(orders);
      //   });
      // },
      // getDailyRevenue() {
      //   const currentDate = new Date().toDateString();
      //   return new Promise(async (resolve, reject) => {
      //     const sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      //       {
      //         $match: { date: currentDate },
      //       },
      //       {
      //         $group: {
      //           _id: null,
      //           total: { $sum: '$TotalAmount' },
      //         },
      //       },
      //     ]).toArray();
      //     if (sales.length === 0) {
      //       reject();
      //     } else {
      //       resolve(sales[0].total);
      //     }
      //   });
      // },
      //  getWeeklyRevenue() {
      //   return new Promise(async (resolve, reject) => {
      //     const sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      //       {
      //         $match: { date: { $gte: new Date(new Date().getDate() - 7) } },
      //       },
      //       {
      //         $group: {
      //           _id: null,
      //           total: { $sum: '$totalPrice' },
      //         },
      //       },
      //     ]).toArray();
      //     if (sales.length !== 0) {
      //       resolve(sales[0].total);
      //     } else {
      //       reject();
      //     }
      //   });
      // },
      //  getYearlyRevenue() {
      //   return new Promise(async (resolve, reject) => {
      //     const sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      //       {
      //         $match: { date: { $gte: new Date(new Date().getFullYear - 1) } },
      //       },
      //       {
      //         $group: {
      //           _id: null,
      //           total: { $sum: '$totalPrice' },
      //         },
      //       },
      //     ]).toArray();
      //     if (sales.length !== 0) {
      //       resolve(sales[0].total);
      //     } else {
      //       reject();
      //     }
      //   });
      // },
      //  revenueGraph() {
      //   return new Promise(async (resolve, reject) => {
      //     const cod = await db.get().collection(collection.ORDER_COLLECTION).find({ PaymentMethod: 'COD' }).toArray();
      //     const online = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod:'ONLINE' }).toArray();
      
      //     resolve({ cod: cod.length, online: online.length });
      //   });
      // } ,  
      TotalSales:()=>{

        return new Promise(async(resolve,reject)=>{

            let TotalSales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                { $group: { _id: null, count: { $sum: 1 } } }

            ]).toArray()
            
            resolve(TotalSales[0].count)

        })
    },
    TodayOrders:()=>{
        const currentDate = new Date();
        return new Promise(async (resolve, reject) => {
            try {
                const order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                  {
                    $match: {
                      date: {
                        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
                      }
                    }
                  },
                
                { $group: { _id: null, count: { $sum: 1 } } }
                ]).toArray();
               console.log(order,"todayorder");
               if (order.length > 0) {
                resolve(order[0].count);
               }else{
                resolve(0);
               }
              }catch (error) {
                console.error(error);
                reject(error);
              }
              
        });
      },
      ThisWeekOrders:()=>{
        const currentDate = new Date();
        return new Promise(async (resolve, reject) => {
            const Weekorders = await db.get().collection(collection.ORDER_COLLECTION)
              .find({
                $and: [
                  { date: { $lte: new Date() } },
                  { date: { $gte: new Date(new Date().getDate() - 7) } },
               
                ],
              }).toArray();
              const count = Object.values(Weekorders).length;
              console.log(count,"Weekorder");
            resolve(count);
          //   try {
          //     const order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
          //       {
          //         $match: {
          //           date: {
          //             $lte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
          //             $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() -7)
          //           }
          //         }
          //       },
              
          //     { $group: { _id: null, count: { $sum: 1 } } }
          //     ]).toArray();
          //    console.log(order,"todayorder");
          //    if (order.length > 0) {
          //     resolve(order[0].count);
          //    }else{
          //     resolve(0);
          //    }
          //   }catch (error) {
          //     console.error(error);
          //     reject(error);
          //   }
          });
      },
      ThisMonthOrders:()=>{
       
        return new Promise(async (resolve, reject) => {
            const Monthorders = await db.get().collection(collection.ORDER_COLLECTION)
              .find({
                $and: [
                  { date: { $lte: new Date() } },
                  { date: { $gte: new Date(new Date().getDate() - 30) } },
               
                ],
              }).toArray();
              const count = Object.values(Monthorders).length;
              console.log(count,"Monthorders");
            resolve(count);
          });
       

      },
      ThisYearOrders:()=>{
        const currentDate = new Date();
        return new Promise(async (resolve, reject) => {
            const currentDate = new Date();
            const nextYear = new Date(currentDate.getFullYear() + 1, 0, 1);
            
            const yearOrderCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $match: {
                  date: {
                    $gte: new Date(currentDate.getFullYear(),  -365),
                    $lt: nextYear
                  }
                }
              },
              { $group: { _id: null, count: { $sum: 1 } } }
            ]).toArray();
            
            console.log(yearOrderCount);
            resolve(yearOrderCount[0].count)
            
        });
      },
      TotalRevenues:()=>{
       
        return new Promise(async(resolve,reject)=>{
        
            
            let Result=await db.get().collection(collection.ORDER_COLLECTION).aggregate([

              { $match: {status:'Delivered'} },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$TotalAmount' },
                      },
                }
            ]).toArray()
           

            if (Result.length > 0 && Result[0]) {
              resolve(Result[0].total)
            } else {
              reject(new Error('Could not retrieve total revenue'))
            }
            


        })


      },
      TodayRevenue:()=>{

        const currentDate = new Date();
        return new Promise(async (resolve, reject) => {
            try {
                const TodayRevenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                  {
                    $match: {
                      status:'Delivered',
                      date: {
                        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
                      }
                    }
                  },
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$TotalAmount' },
                  },
                },
                ]).toArray();
               console.log(TodayRevenue,"todayorder");
               if (TodayRevenue.length > 0) {
                resolve(TodayRevenue[0].total);
               }else{
                resolve(0);
               }
              }catch (error) {
                console.error(error);
                reject(error);
              }
              
        });
      },
      WeekRevenue(){
        
        return new Promise(async (resolve, reject) => {
            const Weeksales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $match: { status:'Delivered',date: { $gte: new Date(new Date().getDate() - 7) } },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$TotalAmount' },
                },
              },
            ]).toArray();
            if (Weeksales.length !== 0) {
            console.log(Weeksales);
              resolve(Weeksales[0].total);
            } else {
              reject();
            }
          });

      },
      YearRevenue:()=>{
        
        const currentDate = new Date();
        return new Promise(async (resolve, reject) => {
            const currentDate = new Date();
            const nextYear = new Date(currentDate.getFullYear() + 1, 0, 1);
            
            const YearRevenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $match: {
                  status:'Delivered',
                  date: {
                    $gte: new Date(currentDate.getFullYear(),  -365),
                    $lt: nextYear
                  }
                }
              },
              {
                $group: {
                    _id: null,
                    total: { $sum: '$TotalAmount' },
                  },
              }
            ]).toArray();
            
            console.log(YearRevenue);
            resolve(YearRevenue[0].total)
            
        });

      },
//       MonthRevenue:()=>{
           
//         const currentDate = new Date();
//         return new Promise(async (resolve, reject) => {
            
//             const currentDate = new Date();
// const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
// const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

// const monthRevenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
//   {
//     $match: {
//       shippingStatus:'Delivered',
//       date: {
//         $gte: monthStart,
//         $lt: monthEnd
//       }
//     }
//   },
//   {
//     $group: {
//       _id: null,
//       total: { $sum: '$TotalAmount' },
//     }
//   }
// ]).toArray();

// // console.log(monthRevenue[0].total);

//           resolve(monthRevenue[0].total)    
//         });
      
      // },
      admindashboardChart:()=>{

          return new Promise(async(resolve,reject)=>{
            
           let data={}
           data.PAYPAL= await db.get().collection(collection.ORDER_COLLECTION).find({PaymentMethod:'PAYPAL'}).count()   
           data.RAZORPAY= await db.get().collection(collection.ORDER_COLLECTION).find({PaymentMethod:'RAZORPAY'}).count()
           data.COD= await db.get().collection(collection.ORDER_COLLECTION).find({PaymentMethod:'COD'}).count()
           data.ONLINE= await db.get().collection(collection.ORDER_COLLECTION).find({PaymentMethod:'ONLINE'}).count()
           data.PENDING= await db.get().collection(collection.ORDER_COLLECTION).find({status:'pending'}).count()
           data.DELIVERED= await db.get().collection(collection.ORDER_COLLECTION).find({status:'Delivered'}).count()
           data.CANCEL= await db.get().collection(collection.ORDER_COLLECTION).find({status:'order cancelled'}).count()
           data.SHIPPED= await db.get().collection(collection.ORDER_COLLECTION).find({status:'shipped'}).count()
           data.PLACED= await db.get().collection(collection.ORDER_COLLECTION).find({status:'placed'}).count()

           console.log(data.CANCEL);
           console.log(data.DELIVERED);
           console.log(data.PENDING);
           console.log(data.COD);
           console.log(data.ONLINE);
           resolve(data)
              
             
             
           
           
          })

      },
      getAllusersdashboard:()=>{

        return new Promise(async(resolve,reject)=>{

          let usersdashboard= await db.get().collection(collection.USER_COLLECTION).find().toArray()
          resolve(usersdashboard)
        })
      },
      async createCoupon(coupon) {
        let applyCoupon = false;
        if (coupon.type == 'product') {
          coupon.percentage = parseInt(coupon.percentage);
          coupon.isoDateEnd = new Date(coupon.endDate);
          coupon.id = ObjectId(coupon.id);
      
          const offerField = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ $and: [{ _id: coupon.id }, { offer: { $exists: true } }] });
          if (offerField) {
            const data = await db.get().collection(collection.COUPON_COLLECTION).findOne({ $and: [{ type: 'category' }, { category: offerField.category }] });
            console.log(data);
            if (data) {
              if (coupon.percentage > data.percentage) {
                applyCoupon = true;
              }
            }
          } else {
            applyCoupon = true;
          }
        } else {
          coupon.limit = parseInt(coupon.limit);
          coupon.code = coupon.code.toUpperCase();
          coupon.percentage = parseInt(coupon.percentage);
          coupon.isoDateStart = new Date(coupon.startDate);
          coupon.isoDateEnd = new Date(coupon.endDate);
        }
        if (coupon.type == 'category') {
          coupon.categoryOption = true;
        }
        return new Promise(async (resolve, reject) => {
          db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon);
          if (coupon.type == 'category') {
            var samp = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
              {
                $match: { category: coupon.category },
              },
              {
                $project: { price: 1 },
              },
      
              {
                $addFields: {
                  offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', coupon.percentage] }, 100] }] },
      
                },
              },
            ]).forEach((element) => {
              db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: element._id }, {
                $set: {
                  offer: element.offer,
                },
              });
            });
          } else if (coupon.type == 'product' && applyCoupon) {
            var samp = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
              {
                $match: { _id: coupon.id },
              },
              {
                $project: { price: 1 },
              },
      
              {
                $addFields: {
                  offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', coupon.percentage] }, 100] }] },
      
                },
              },
            ]).toArray();
            console.log(samp, '>>>>>>>>>>>>>>>>>>>>>>');
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: coupon.id }, {
              $set: {
                offer: samp[0].offer,
              },
            });
          }
      
          resolve();
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
      romoveCoupon(id) {
        console.log('called>>>>>>>>', id);
        return new Promise(async (resolve, reject) => {
          const coupon = await db.get().collection(collection.COUPON_COLLECTION).findOneAndDelete({ _id: ObjectId(id) });
          if (coupon.value.type == 'category') {
            db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ category: coupon.value.category }, {
              $unset: { offer: 1 },
            });
          } else if (coupon.value.type == 'product') {
            db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: coupon.value.id }, {
              $unset: { offer: 1 },
            });
          }
          resolve();
        });
      },
      editCoupon(id) {
        return new Promise(async (resolve, reject) => {
          const coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ _id: ObjectId(id) });
          resolve(coupon);
        });
      },
      editCouponSubmit(id, data) {
        data.percentage = parseInt(data.percentage);
        data.limit = parseInt(data.limit);
        data.code = data.code.toUpperCase();
        console.log(data);
        return new Promise(async (resolve, reject) => {
          const res = await db.get().collection(collection.COUPON_COLLECTION).findOneAndUpdate({ _id: ObjectId(id) }, {
            $set: {
              name: data.name,
              code: data.code,
              startDate: data.startDate,
              endDate: data.endDate,
              percentage: data.percentage,
              limit: data.limit,
              isoDateStart: new Date(data.startDate),
              isoDateEnd: new Date(data.endDate),
            },
          }, { returnDocument: 'after' });
          console.log('>>>>>>>>', res, '<<<<<<<<<<<');
          if (res.value.type == 'category') {
            var samp = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
              {
                $match: { category: res.value.category },
              },
              {
                $project: { price: 1 },
              },
      
              {
                $addFields: {
                  offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', res.value.percentage] }, 100] }] },
      
                },
              },
            ]).forEach((element) => {
              db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: element._id }, {
                $set: {
                  offer: element.offer,
                },
              });
            });
          } else if (res.value.type == 'product') {
            var samp = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
              {
                $match: { _id: res.value.id },
              },
              {
                $project: { price: 1 },
              },
      
              {
                $addFields: {
                  offer: { $subtract: ['$price', { $divide: [{ $multiply: ['$price', res.value.percentage] }, 100] }] },
      
                },
              },
            ]).toArray();
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: res.value.id }, {
              $set: {
                offer: samp[0].offer,
              },
            });
          }
      
          resolve();
        });
      },
      getAllStocks() {
        return new Promise(async (resolve, reject) => {
          const books = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
          resolve(books);
        });
      },   


}
      
