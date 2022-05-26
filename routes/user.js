
const { request } = require("express");
var express = require("express");
// const collections = require("../config/collections");
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require("../helpers/user-helpers");
const multer = require('multer')

const verifyLogin=(req,res,next)=>{
   if (req.session.loggedIn){
    next()
   }else{
   res.redirect('/login')
   }
}

/* GET home page. */
router.get("/", async function (req, res, next) {
 let user = req.session.user
 console.log(user);
 let cartCount=null
 if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
 }
 productHelpers.getAllProducts().then((products)=>{ 
     
  res.render('user/view-product',{products,user,cartCount})   
   });
});
router.get('/login',(req,res)=>{ 
   if (req.session.loggedIn){
      res.redirect('/')
   }else { 

      res.render('user/login',{"loginErr":req.session.loginErr})
      req.session.loginErr=null
   }          

});

router.get('/signup',(req,res)=>{
   res.render('user/signup')
})
router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
      console.log(req.body);   
      req.session.loggedIn = true
      req.session.user=response
      res.redirect('/')
   })
});
router.post('/login',(req,res)=>{
   userHelpers.doLogin(req.body).then((response)=>{ 

         if(response.status){
            req.session.loggedIn=true 
            req.session.user=response.user 
            res.redirect('/')
         }else{
             req.session.loginErr="Invalid username or password"
            res.redirect('/login')
         }
      });
   });  

router.get('/logout',(req,res)=>{
   req.session.destroy()
   res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
   let products =await userHelpers.getCartProducts(req.session.user._id)
   let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
   console.log(products);
   
 res.render('user/cart',{products,user:req.session.user._id,totalValue})  
})


router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call.......")
userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
   res.json({status:true})
})
})
router.post('/change-product-quandity',(req,res,next)=>{
   console.log(req.body);

   userHelpers.changeproductQuandity(req.body).then(async(response)=>{
      response.total=await userHelpers.getTotalAmount(req.body.user) 
      res.json(response) 

   })
})
 
router.get('/place-order',verifyLogin,async(req,res)=>{
   let  total=await userHelpers.getTotalAmount(req.session.user._id)
   res.render('user/place-order',{total})
   
})
module.exports = router;

