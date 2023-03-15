var express = require('express');
var router = express.Router();

const {loginPage,homePage,userSignup,loginAction ,viewProducts,userlogout,singleproduct,otplogin,otpverify,verifyotp,cartPage,addtocart,changequantity,removeCartItem,proceedToCheckout,placeOrder,verifypayment,orderDetails,userOrderView,OrderCancel,userProductView,forgotpassword,forgotverify,successotp,passwordchange,passwordchanged,saveaddress,addadressform,makeDefaultAddress,userprofile,usereditprofile,editprofile,userOrderAddress,deleteAddress,mailpassotp,mailverifyotp,submitverifyotp,returnOrder,checkCoupon,getOffers,categoryfilter,AddToWishlist,wishlistPage,removeWishlistItem,search,searchProducts,priceFilter} = require('../controller/user-controller');
const {nocache ,sessionCheck, loginRedirect} = require('../middlewares/user-middlewares');

/* GET users listing. */
router.get('/',homePage);
router.get('/login-page',nocache , loginRedirect , loginPage);
router.post('/user-signup',userSignup);
router.post('/login-action',loginAction);
router.get('/viewlistProducts',viewProducts);
router.get('/logoutBUTTON',userlogout);
router.get('/productDetails/:id', singleproduct);
router.get('/otplogin',otplogin);
router.post('/otpVerify',otpverify);
router.post('/successOtpverify',verifyotp);
router.get('/cart',sessionCheck,cartPage);
router.get('/addtocart/:id',sessionCheck, addtocart);
router.post('/change-product-quantity',sessionCheck,changequantity);
router.post('/remove_cartItem',sessionCheck,removeCartItem);
router.get('/proceedToCheckout',sessionCheck,proceedToCheckout);
router.post('/place-order',sessionCheck,placeOrder);
router.post('/verifypayment',sessionCheck,verifypayment);
router.get('/orderDetails',sessionCheck,orderDetails);
router.get('/vieworder',sessionCheck, userOrderView);
router.post('/orderCancel/:id',sessionCheck, OrderCancel)
router.get('/userProductView/:id',sessionCheck, userProductView);
router.get('/forgotpassword',forgotpassword);
router.post('/forgotverify',forgotverify);
router.post('/successpasswordverify',successotp);
router.get('/passwordchange',passwordchange);
router.post('/passwordchanged',passwordchanged);
router.post('/submitaddress',saveaddress);
router.get('/addaddressform',addadressform);
router.get('/makeAddressDefault/:id',sessionCheck, makeDefaultAddress);
router.get('/userprofile',sessionCheck,userprofile);
router.post('/user-edit-profile',usereditprofile);
router.get('/userOrderAddress/:id',sessionCheck,userOrderAddress);
router.get('/deleteuseraddress/:id',deleteAddress);
router.get('/mailpassotp',mailpassotp);
router.post('/mailverifyotp',mailverifyotp);
router.post('/submitOtpverify',submitverifyotp);
router.get('/editprofile',sessionCheck,editprofile);
router.get('/return-order/:id',sessionCheck,returnOrder)
router.post('/checkcoupon', sessionCheck, checkCoupon);
router.post('/filter-product', categoryfilter);
router.get('/offers', getOffers);
router.get('/add-to-wishlist/:id',sessionCheck,AddToWishlist)
router.get('/wishlist',sessionCheck, wishlistPage);
router.post('/remove_wishlistItem',sessionCheck, removeWishlistItem);
router.post('/search', search);
router.get('/products/',sessionCheck,searchProducts)
router.post('/priceFilter', priceFilter);
module.exports = router;