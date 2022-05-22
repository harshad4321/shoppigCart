 

 var db=require('../config/connection')
 var collection=require('../config/collections')
 const bcrypt=require('bcrypt');
const { response } = require('express');
var objectId=require('mongodb').ObjectId
 

module.exports={
    doSignup:(userData)=>{
        return new Promise (async(resolve,reject)=>{
         userData.password=  salt=   await bcrypt.genSalt(10);
             await  bcrypt.hash(userData.password,10,(err, password,hash) => {
                if(err) throw (err);
                 else
                password=hash
                  db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                    resolve(data) 
                    // console.log(userData.password)
                    // console.log(userData.email)                    
                });
                });
            }); 
     },
        
     doLogin:(userData)=>{
        return new Promise(async (resolve, reject)=> {
            let loginStatus = false
            let response = {}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({ email:userData.email })
            .then((user)=>{

            //  if (user) {
// check if password matches    
           await bcrypt.compare(userData.password,user.password ,(err,match,next)=> {
                console.log(user.password)
                console.log(userData.password)
               
                
            if (err) throw err; 

                      else {
                        if (!match) {
                            console.log('login failed try again');
                        // resolve({status: false})
                        } else {
                           console.log("login success...");
                       // response.user=user
                       // response.status=true
                       // resolve(response)
                        }
                    } 
                })
              })// else {
            //     console.log("login failed because email is not there..")
            //     //     resolve({status: false})
            // }
        })
    
    },
   addToCart:(proId,userId)=>{
       return new Promise(async(resolve,reject)=>{
           let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
           if(userCart){
               db.get().collection(collection.CART_COLLECTION)
               .updateOne({user:objectId(userId)},
                {
 
                        $push:{products:objectId(proId)}
               
                }
               ).then((response)=>{
                   resolve()
               })
           }else{
               let cartObj={
                   user:objectId(userId),
                   products:[objectId(proId)]
               }  
               db.get().collection(collection.CART_COLLECTION).insertOne (cartObj).then((response)=>{
                   resolve()
               })
           }

       })
   },
  getCartProducts:(userId)=>{
      return new Promise(async(resolve,reject)=>{
          let cartItem=await db.get().collection(collection.CART_COLLECTION).aggregate([
              {
                  $match:{user:objectId(userId)}
              },{
                  $lookup:{
                      from:collection.PRODUCT_COLLECTION,
                      let:{prodList:'$products'},
                      pipeline:[
                          {
                              $match:{
                                  $expr:{
                                      $in:['$_id',"$$prodList"]
                                  }
                              }
                          }
                      ],
                      as:'cartItems'
                  }
              }
          ]).toAarray()
          resolve(cartItems[0].cartItems )
      })
  }

}
 
