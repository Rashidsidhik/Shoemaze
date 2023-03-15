var express = require('express');
var router = express.Router();
const upload = require('../utils/multer')

const {adminLoginpage,loginAdmin,adminlogout,adminAlluser,categorypage,ordersAdmin ,getAllUsers ,editsubmit,deleteproduct,adminBlockUser ,adminUnBlockUser ,addProducts ,addProductsSubmit,editProducts,addedCategory,editCategory,editCategorySubmit,deleteCategory,adminOrderView,adminOrderCancel,shippedOrder,deliveredOrder,viewOrderProduct,salesReportPage,saleFilter,dashboard,getCoupon,addCoupon,codeGenerator,addCouponSubmit,couponEdit,deleteCoupon,couponEditSubmit } = require('../controller/admin-controller');
const {nocache , loginRedirect,sessionCheck} = require('../middlewares/admin-middlewares');


router.get('/', nocache , loginRedirect ,adminLoginpage);
router.post('/login-action', loginAdmin);
router.get('/logout-action', adminlogout);
// router.get('/dashboard', sessionCheck, adminDashboard);
// router.post('/reports', sessionCheck, salesReport);
// router.post('/revenue', sessionCheck, revenueReport);
router.get('/alluser',sessionCheck, adminAlluser , getAllUsers);
router.get('/allcategory',sessionCheck,categorypage);
router.get('/allorders',sessionCheck,ordersAdmin);
router.get('/blockUser', sessionCheck, adminBlockUser);            
router.get('/unBlockUser',sessionCheck,  adminUnBlockUser);
router.get('/addproducts', sessionCheck, addProducts);
router.post('/addProduct-submit',
    upload.fields([
      { name: 'image1', maxCount: 1 },
      { name: 'image2', maxCount: 1 },
      { name: 'image3', maxCount: 1 },
    
    ]),addProductsSubmit);
router.get('/editproduct/:id', sessionCheck,editProducts);
router.post('/editProduct-submit/:id',
upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },

]), editsubmit);
router.post('/delete-product',sessionCheck, deleteproduct);
router.post('/addedCategory' ,sessionCheck,addedCategory);
router.get('/editCategory/:id',sessionCheck, editCategory);
router.post('/deleteCategory',sessionCheck, deleteCategory);
router.post('/editCategory-Submit/:id', editCategorySubmit);
router.get('/orders', sessionCheck, adminOrderView); 
router.post('/adminOrderCancel/:id', adminOrderCancel)
router.get('/shipped-order/:id', shippedOrder)
router.get('/deliveredOrder/:id', deliveredOrder)
router.get('/view-order-product/:id',sessionCheck, viewOrderProduct);
router.get('/salesreport', sessionCheck, salesReportPage);
router.post('/sale-filter', saleFilter);
router.get('/dashboard', sessionCheck,dashboard);
router.get('/coupon', sessionCheck, getCoupon);
router.get('/addcoupon', sessionCheck, addCoupon);
router.get('/generatecode', sessionCheck, codeGenerator);
router.post('/addcouponsubmit', sessionCheck, addCouponSubmit);
router.get('/editcoupon/:id', sessionCheck, couponEdit);
router.post('/deletecoupon',sessionCheck, deleteCoupon);
router.post('/editcouponsubmit/:id', sessionCheck, couponEditSubmit);


module.exports = router;
