const {  getCartTotalAmount } = require('../model/user-helpers');



async function getTotalPrice(req) {
    let usere=req.session.users;
    
    return getCartTotalAmount(usere._id).then((total) => total).catch(() => {
      console.log('get totel amount error');
      const total = null;
      return total;
    });
  }
module.exports = {  getTotalPrice };
