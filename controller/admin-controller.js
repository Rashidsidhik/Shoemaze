const { doadminLoged ,blockUser ,unblockUser,OrderDetails,OrderCancelled,viewSingleOrder,orderShipped,orderdelivered,getSalesReport,filterSale,getAllusersdashboard,admindashboardChart,YearRevenue,WeekRevenue,TotalSales,TodayOrders,ThisWeekOrders,ThisMonthOrders,ThisYearOrders,TotalRevenues,TodayRevenue,getAllCoupons,getAllStocks,createCoupon,editCoupon,editCouponSubmit,romoveCoupon,stockIncreamentAfterReturn,orderProductList} = require('../model/admin-helpers');
const { getAllUser } = require('../model/user-helpers');
var productHelpers = require('../model/product-helpers');
const { response } = require('express');
const cloudinary = require('../utils/cloudinary')
const multer = require('multer')
const path = require('path')
const voucher_codes = require('voucher-code-generator');

module.exports = multer({
    storage: multer.diskStorage({
    }),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
            cb(new Error("File type is not supported"), false)
            return
        }
        cb(null,true) 
}
})
   
module.exports = {
    adminLoginpage(req, res) {
    res.render('admin/admin-login', { layout: 'admin-layout' });
    },
    
    loginAdmin(req, res) {
                doadminLoged(req.body).then((response) => {
                    req.session.adminloggedIn = true;
                    req.session.admin= response;
                    res.redirect('/admin/dashboard')
            // res.render('admin/admin-land', { layout: 'admin-layout', admin: true });
        }).catch((error) => {
            res.render('admin/admin-login', { error: 'Invalid login details' })
        })
    },
    adminlogout(req, res) {
      console.log("eFQweatgaeEWYGUYGYTDTRDYTGWD");
      req.session.admin=null;
      req.session.adminloggedIn=false;
      res.redirect('/admin')
    },

    adminAlluser(req, res) {
       getAllUser().then((AllUsers) => {
            
            res.render('admin/all-users', { layout: 'admin-layout', AllUsers, admin: true })
        })
    },

    categoryAdmin(req,res){
        res.render('admin/all-category', {layout: 'admin-layout',admin:true});
    },

    ordersAdmin(req,res){
        productHelpers.getAllProducts().then((products)=>{
            console.log("//////////////////////////////////////////////////////////////");
            res.render('admin/all-products', {layout: 'admin-layout',admin:true ,products});
        })
       
    },

    getAllUsers: (req, res) => {
        userHelpers.getAllUsers().then((AllUsers) => {
            res.render('admin/all-users', { layout: 'admin-layout', AllUsers, admin: true })
        })
    },

    adminBlockUser: (req, res) => {
        let blockUserId = req.query.id
        blockUser(blockUserId)
        res.redirect('/admin/alluser')
    },
    //UNBLOCK USER
    adminUnBlockUser: (req, res) => {
        let unblockUserId = req.query.id
        unblockUser(unblockUserId)
        res.redirect('/admin/alluser')
    },

    addProducts (req,res){
        productHelpers.getAllcategory().then((getcategory)=>{
        res.render('admin/add-products', { layout: 'admin-layout', admin: true,getcategory })
    })
    },

    async addProductsSubmit(req, res){
          console.log(req.files);console.log(req.body);
          const cloudinaryImageUploadMethod = (file) => {
            console.log("qwertyui");
            return new Promise((resolve) => {
              cloudinary.uploader.upload(file, (err, res) => {
                console.log(err, " asdfgh");
                if (err)
                  console.log(err,"sssssssssssssssssssssssss");
                resolve(res.secure_url)
              })   
            })
          }
        
          const files = req.files
          let arr1 = Object.values(files)
          let arr2 = arr1.flat()
          const urls = await Promise.all(
            arr2.map(async (file) => {
              const { path } = file
              const result = await cloudinaryImageUploadMethod(path)
              return result
            })
          )
          
       
        
        // var image=req.files.Image
        // var image1=req.files.Image1
        // var image2=req.files.Image2
        // var image3=req.files.Image3

        productHelpers.addProduct(req.body,urls).then((response)=>{
            

          
                             
                           
         res.redirect('/admin/addproducts')
                           

                     
        })
        
    },
    async editProducts (req,res){
        
            let product=await productHelpers.getproductDetails(req.params.id)
            console.log(product);
            productHelpers.getAllcategory().then((getcategory)=>{
        res.render('admin/edit-products', { layout: 'admin-layout', admin: true,product,getcategory})
            })
    },
    async editsubmit(req,res){
      console.log(req.files);console.log(req.body.brand);
      const cloudinaryImageUploadMethod = (file) => {
        console.log("qwertyui");
        return new Promise((resolve) => {
          cloudinary.uploader.upload(file, (err, res) => {
            console.log(err, " asdfgh");
            if (err)
              console.log(err,"sssssssssssssssssssssssss");
            resolve(res.secure_url)
          })   
        })
      }
    
      const files = req.files
      let arr1 = Object.values(files)
      let arr2 = arr1.flat()
      const urls = await Promise.all(
        arr2.map(async (file) => {
          const { path } = file
          const result = await cloudinaryImageUploadMethod(path)
          return result
        })
      )
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
console.log(req.params.id);
        let id=req.params.id
        console.log(req.body.brand);
        productHelpers.adminEditsubmit(req.params.id,req.body,urls).then(()=>{   
          res.redirect('/admin/allorders')
            console.log(req.file);
            //  if(req.files?.Image){
    
            // let image=req.files.Image
            // image.mv('./public/product-images/'+id+'.jpg')
    
             
            //  }  
        
    })
    
    },
    deleteproduct(req,res){

        let deleteid=req.body.id
        productHelpers.removeProduct(deleteid).then((response)=>{
    
          res.redirect('/admin/allorders')
        })
       },
       categorypage(req,res,next){
     
        productHelpers.getAllcategory().then((getcategory)=>{
            
            
          res.render('admin/adminCategory',{layout: 'admin-layout', admin:true,getcategory})
        })
        
       },
       addcategory(req,res,next){
    
         
    
          res.redirect('/admin/Category')
         
       },
       addedCategory(req,res,){
         
        productHelpers.AddCategorys(req.body).then((addcategory)=>{
    
          res.redirect('/admin/allcategory')
        })
    
       },
       editCategory(req,res,next){
         
        let categoryid=req.params.id
        productHelpers.adminCategoryEdit(categoryid).then((categoryEdit)=>{
    
          res.render('admin/editCategory',{layout: 'admin-layout', admin:true,categoryEdit})
        })
        
    
       },
       editCategorySubmit(req,res,next){
          
        productHelpers.CategoryEdit(req.params.id,req.body).then(()=>{
    
          res.redirect('/admin/allcategory')
         })
       },
    
       deleteCategory(req,res){
        
        let deleteCategoryid=req.body.id
          
        productHelpers.removeCategory(deleteCategoryid).then((response)=>{
          
          res.redirect('/admin/allcategory')
        })
        
       },
      
    adminOrderView(req,res){
  

       
        OrderDetails().then((OrderDetails)=>{
      console.log(OrderDetails);
          res.render('admin/orders',{layout: 'admin-layout',admin:true,OrderDetails})
        })
       
        
      
      },
      adminOrderCancel(req,res){
    
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
      
               res.redirect('/admin/orders')
        })
      })
    })
      },
      viewOrderProduct(req, res) {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        viewSingleOrder(req.params.id).then((products) => {
          res.render('admin/viewOrderProducts', { layout:'admin-layout',admin: true, products });
        }).catch(() => {
      
        });
      },
      shippedOrder(req,res){
        let orderId = req.params.id
        orderShipped(orderId).then((order) => {
          res.redirect('/admin/orders')
        })
      } ,
      deliveredOrder(req,res){
        let orderId = req.params.id
        orderdelivered(orderId).then((order) => {
          res.redirect('/admin/orders')
        })
      } ,
      salesReportPage(req, res) {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>sza");
        getSalesReport().then((report) => {
          res.render('admin/salesreport', {layout: 'admin-layout', report, admin: true });
          
        }); 
      },
      saleFilter(req, res) {
        filterSale(req.body.startDate, req.body.endDate).then((report) => {
          const dates = {
            start: req.body.startDate,
            end: req.body.endDate,
          };
          res.render('admin/salesreport', { layout: 'admin-layout',report, admin: true, dates });
        }).catch(() => {
          res.render('admin/salesreport', { layout: 'admin-layout',admin: true });
        });

},
// async salesReport(req, res) {
//   if (req.body.data === 'daily') {
//     salesTitle = 'Today';
//     reports = await getDailyOrder();
//   } else if (req.body.data === 'weekly') {
//     salesTitle = 'Weekly';
//     saleStatus = true;
//     reports = await weeklyOrders();
//   } else if (req.body.data === 'yearly') {
//     salesTitle = 'Yearly';
//     saleStatus = true;
//     reports = await yearlyOrders();
//   }
//   report = reports.length;
//   const users = await totalusers();
//   res.render('admin/dashboard', {layout: 'admin-layout',admin: true, report, users: users.length, salesTitle, });
// },
// async  revenueReport(req, res) {
//   if (req.body.data === 'daily') {
//     revenueTitle = 'Daily';
//     revenReport = await getDailyRevenue();
//   } else if (req.body.data === 'weekly') {
//     revenueStatus = true;
//     revenueTitle = 'Weekly';
//     revenReport = await getWeeklyRevenue();
//   } else if (req.body.data === 'yearly') {
//     revenueStatus = true;
//     revenueTitle = 'Yearly';
//     revenReport = await getYearlyRevenue();
//   }
//   const users = await totalusers();
//   res.render('admin/dashboard', {layout: 'admin-layout',admin: true, report, users: users.length, revenReport, salesTitle, revenueTitle,});
// },

// async adminDashboard(req, res) {
//   console.log('dashboard called');
//   const users = await totalusers();
//   const graph = await revenueGraph();
//   try {
//     if (!saleStatus) {
//       salesTitle = 'Today';
//       reports = await getDailyOrder();
//       report = reports.length;
//     }
//     if (!revenueStatus) {
//       revenueTitle = 'Today';
//       revenReport = await getDailyRevenue();
//     }
//     const graph = await revenueGraph();
//     const currentDate = new Date().toISOString().substring(0, 10);
//     console.log(graph.online);
//     res.render('admin/dashboard', {layout: 'admin-layout',
//       admin: true,
//       report,
//       users: users.length,
//       currentDate,
//       revenReport,
//       salesTitle,
//       revenueTitle,
//       cod: graph.cod,
//       online: graph.online,
//     });
//   } catch (err) {
//     console.log("<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>");
//     res.render('admin/dashboard', {layout: 'admin-layout',cod: graph.cod,online: graph.online,admin: true,});
//   }
// },
dashboard(req,res){

   
  TotalSales().then((TotalSales)=>{

    TodayOrders().then((TodaySales)=>{
   
      ThisWeekOrders().then((WeekSales)=>{

        ThisMonthOrders().then((MonthSales)=>{

          ThisYearOrders().then((YearSales)=>{
   
            TotalRevenues().then((TotalRevenue)=>{

              TodayRevenue().then((TodayRevenue)=>{

                WeekRevenue().then((WeekRevenue)=>{

                  YearRevenue().then((YearRevenue)=>{

                  //  MonthRevenue().then((MonthRevenue)=>{
                     
                    admindashboardChart().then((data)=>{
                       
                      getAllusersdashboard().then((usersdashboard)=>{

                        console.log(TotalSales);

                        res.render('admin/admindashboard',{layout: 'admin-layout',admin: true,user:false,TotalSales,TodaySales,WeekSales,MonthSales,YearSales,TotalRevenue,TodayRevenue,WeekRevenue,YearRevenue,data,usersdashboard})
                      })
            
        
                      }).catch((error)=>{
  
                       console.log(error);

                          })
                    })
                             
             

                
                // })

                  })

                  
               

              })
              
            

            })
   
       


        })

          })


        })

    })

    }) 
   
  
 },
getCoupon(req, res) {
  getAllCoupons().then((coupons) => {
    res.render('admin/coupon', { layout: 'admin-layout',admin: true, coupons });
  }).catch(() => {
    res.render('admin/coupon', { layout: 'admin-layout',admin: true });
  });
},
async addCoupon(req, res) {
  const product = await getAllStocks();
  productHelpers.getAllcategory().then((data) => {
    res.render('admin/addCoupon', {layout:'admin-layout',admin: true, data, product });
  });
},
codeGenerator(req, res) {
  const code = voucher_codes.generate({
    length: 6,
    count: 1,
    charset: '012345ABCDE',
  });
  res.json(code[0]);
},
addCouponSubmit(req, res) {
  console.log(req.body);
  createCoupon(req.body).then(() => {
    res.redirect('/admin/coupon');
  });
},
deleteCoupon(req, res) {
  romoveCoupon(req.body.id).then(() => {
    res.json({ status: true });
  });
},
couponEdit(req, res) {
  let product;
  let catego;
  let norm;
  editCoupon(req.params.id).then((coupon) => {
    if (coupon.type == 'product') {
      product = true;
    } else if (coupon.type == 'category') {
      catego = true;
    } else {
      norm = true;
    }
    res.render('admin/editCoupon', {layout: 'admin-layout',
      admin: true, coupon, product, catego, norm,
    });
  });
},
couponEditSubmit(req, res) {
  editCouponSubmit(req.params.id, req.body).then(() => {
    res.redirect('/admin/coupon');
  });
},

}