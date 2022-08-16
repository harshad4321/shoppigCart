var express = require("express");
const middleware = require("../middleware");
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers = require("../helpers/user-helpers");





/* GET home page. */
router.get("/", async (req, res, next)=> {
    let user = req.session.user
    console.log('>>>>>user>>',user);
    let cartCount=null
    if(req.session.user){
     cartCount=await userHelpers.getCartCount(req.session.user._id)
    }
   
    productHelpers.getAllProducts().then((products)=>{
      console.log('products',products)
     res.render('user/view-product',{  products,user,cartCount})   
      });
   });
   

   
// GET: view shopping cart contents
router.get('/cart',middleware.verifyLogin,async(req,res,next)=>{
   let products =await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=0 
  if(products.length>0){   
  totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  let proId=req.params.id
  console.log(proId);
  }
  next
  let user=req.session.user._id;
  console.log("user...",user);
res.render('user/cart',{products,user,totalValue,user});
 
})


   
// GET: add a product to the shopping cart when "Add to cart" button is pressed

router.get('/add-to-cart/:id',(req,res)=>{
    
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
      
       res.json({status:true})
    })
    }) 
    router.post('/change-product-quantity',(req,res,next)=>{
       
       userHelpers.changeproductQuantity(req.body).then(async(response)=>{
 
            response.total=await userHelpers.getTotalAmount(req.body.user)
           
            res.json(response) 
        
          
       })
    }) 
    
// GET: remove all instances of a single product from the cart
    
router.post('/remove-product',(req,res)=>{
   userHelpers.removeProduct(req.body).then(async(response)=>{
       res.json(response)  
 
    })
 }) 
   
router.get('/place-order',middleware.verifyLogin,async(req,res)=>{
    let  total=await userHelpers.getTotalAmount(req.session.user._id)

    res.render('user/place-order',{total,user:req.session.user})
   
 })
   
//checking Payment 

router.post('/place-order',async(req,res)=>{
    let products=await userHelpers.getCartProductlist(req.body.userId)
    let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
       console.log('orderid***>>>:',orderId);
       if(req.body['payment-method']==='COD'){
          res.json({codSuccess:true})
       }else {
 userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
 res.json(response)
 })
       }
 
    })
    console.log(req.body);
   
 })
 router.get( '/order-success',(req,res)=>{ 
   res.render('user/order-success',{user:req.session.user}) 
 //  console.log(_id) 
 })



 router.get('/orders',async(req,res)=>{ 
    let orders=await userHelpers.getUserOrders(req.session.user._id) 
    
     res.render('user/orders',{user:req.session.user,orders})    
    })
    router.get('/view-order-products/:id',async(req,res)=>{  
       let products=await userHelpers.getOrderProducts(req.params.id)  
       console.log('0000000000000000000----->>>>>>>>>',req.params.id) 
        res.render('user/view-order-products',{user:req.session.user,products})   
    }) 

    router.post('/verify-payment',(req,res)=>{
    console.log(req.body); 
    userHelpers.verifyPayment(req.body).then(()=>{
       userHelpers.changePaymentStatus(req.body[  'order[receipt]']).then(()=>{
          console.log("Payment successs...") 
          res.json({status:true})
       }) 
    
    }).catch((err)=>{ 
       console.log(err);
       res.json({status:false,errMsg:" "})  
    })
    
    })    
    

   router.get('/over-view-product/:id',async(req,res)=>{ 
     try {
        let user = req.session.user
        let cartCount=null
   if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
   }
     let product=await productHelpers.getProductDetails(req.params.id)
     res.render('user/over-view-product',{product,user,cartCount})
  } catch (error) {
     res.status(500).send({message: error.message || "Error Occured" });
   }
   }) 
   
  


   module.exports=router;
   
   
   