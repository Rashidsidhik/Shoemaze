const { response } = require("express");
const userHelpers = require("../model/user-helpers");

module.exports = {
    sessionCheck:(req,res,next)=>{
        if (req.session.users){
            next();
        }else{
           
            res.redirect('/login-page');
        }
    },

    loginRedirect : (req,res,next)=>{
        if(!req.session.users){
            req.session.loggedIn = false;
        }
        if(req.session.users){
            res.redirect('/');
        }else{
            next();
        }
    },

     nocache : (req, res, next) => {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
      }
      
}