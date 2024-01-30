var db = require('../dbconfig/connection')
var collection = require('../dbconfig/collection')
const { ObjectId } = require('mongodb')

module.exports = {

    async addProduct (product,urls){
        console.log(urls);
        console.log(product);
        product.image=urls;
        product.stock=true;
        product.price = parseInt(product.price);
        product.StockCount = parseInt(product.StockCount);
        product.available=true;
        product.date=new Date()
        let cateName = await this.findCategory(product.categoryid)
       
        
        product.category = cateName.name
      
        return new Promise(async(resolve,reject)=>{
            var item=await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
            
            if(item){
                id=item.insertedId
                resolve(id)
            }else{
                reject()
            }
        }).catch((err)=>{
 })
},


getAllProducts : ()=>{
    return new Promise(async(resolve,reject)=>{
        let products =await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({ dateofpublish: -1 }).toArray()
        resolve(products)
    })
},
getproductDetails: (proId)=>{
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',proId);
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)}).then((product)=>{
           
        resolve(product)
    })
})

},
findCategory(categoryid){
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(categoryid)}).then((categoryData)=>{
            resolve(categoryData)
        })
})
},
async adminEditsubmit(editid,body,urls){
    console.log(body.categoryid);
    let cateName = await this.findCategory(body.categoryid)
    body.price = parseInt(body.price);
    body.StockCount = parseInt(body.StockCount);
    body.available=true 
    body.stock=true
    body.image=urls;
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({_id:ObjectId(editid)},{

            $set:{
                brand:body.brand,
                model:body.model,
                category:cateName.name,
                categoryid:body.categoryid,
                description:body.description,
                color:body.color,
                size:body.size,
                dateofpublish:body.dateofpublish,
                image:body.image,
                price:body.price,
                stock:body.stock,
                StockCount:body.StockCount


            },
            
        }).then((response)=>{

            resolve()
        })
    })
},

removeProduct:(deleteid)=>{
console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    return new Promise((resolve,reject)=>{

        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:ObjectId(deleteid)},
        {

            $set:{available:{$cond:{if:{$gt:["$StockCount",0]},then:true,else:false}}}, 
        }).then((response)=>{

            resolve(response)

        })
   })
 },
//  removeProduct:(deleteid)=>{

//     return new Promise((resolve,reject)=>{

//         db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(deleteid)}).then((response)=>{

//             resolve(response)

//         })
// })
// },
AddCategorys:(addcategory)=>{
    addcategory.date=new Date()
    return new Promise(async(resolve,reject)=>{
     
 db.get().collection(collection.CATEGORY_COLLECTION).insertOne(addcategory).then((addcategory)=>{

        resolve(addcategory)
    })

    })
       

    },
    getAllcategory:()=>{

        return new Promise(async(resolve,reject)=>{

            let getcategory=await db.get().collection(collection.CATEGORY_COLLECTION).find().sort({date:-1}).toArray()
            resolve(getcategory)
        })
    },
    filterByCategory:(proCategory)=>{

        return new Promise(async(resolve,reject)=>{

            let ShowProducts=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:proCategory.name}).toArray()
             console.log(ShowProducts);
            resolve(ShowProducts)
        }).catch((error)=>{

            reject()
        })
    },

    adminCategoryEdit:(categoryid)=>{
      
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectId(categoryid)}).then((categoryEdit)=>{

                resolve(categoryEdit)
            })
        })
    
    },
    CategoryEdit:(EditCategoryId,catID)=>{
       
        return new Promise((resolve,reject)=>{

            db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id:ObjectId(EditCategoryId)},{

                $set:{
                    
                    name:catID.name
                    


                }
            }).then((response)=>{

                resolve()
            })
        })

    },
    removeCategory:(deleteCategoryid)=>{
      
        return new Promise(async(resolve,reject)=>{

            await db.get().collection(collection.CATEGORY_COLLECTION).findOneAndDelete({_id:ObjectId(deleteCategoryid)}).then((response)=>{
         console.log(response);
                db.get().collection(collection.PRODUCT_COLLECTION)
                .updateMany({category:response.value.name},{
                    $unset:{
                        category:response.value.name
                    }
                })
                resolve(response)

            })
  })

},

}