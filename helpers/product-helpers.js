const db = require("../config/externalConnectionsConfig");
const collections = require('../config/databaseCollectionsConfig');
const ObjectId = require("mongodb").ObjectId;
const path = require('path');
const fs = require('fs');
const { error } = require("console");



module.exports = {

    addProduct: (product)=>{

        return new Promise( (resolve,reject)=>{

            try{

                db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data)=>{

                    resolve(data);
                    /*In the above line, we are passing the object named data.
                    This object  is obtained as a result of calling .then in the promise returned by the insertOne function of MongoDb.
                    This object has a key namely insertedId this is the insert id of document created in the db.
                    We send it back in promise resolve.
                    There this id is utilised for setting the name of uploaded image so that,
                    we can establish a relation between each product document in db and its image in server
                    */
                    
                })
            
            }catch(error){
            
                console.error("Error from addProduct product-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getAllProducts: () => {
        
        return new Promise( async (resolve, reject) => {

          try {

                const products = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray();
        
                const categoryIds = products.map((product) => ObjectId(product.category));

                const categories = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION)
                .find({ _id: { $in: categoryIds } }).toArray();

                // console.log(categories);
        
                const categoryMap = categories.reduce((map, category) => {
                
                    map[category._id.toString()] = category;
                    
                    return map;

                }, {});

                // console.log(categoryMap);
        
                const result = products.map((product) => {

                    const categoryId = product.category.toString();

                    const category = categoryMap[categoryId];

                    return {
                        _id: product._id.toString(),
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        category: category ? { _id: category._id.toString(), name: category.name } : null,
                        productOffer:product.productOffer,
                        images:product.images
                    };

                });
        
                // console.log(result);
                
                resolve(result);

            } catch (error) {

                console.error("Error from getAllProducts product-helpers: ", error);

                reject(error);

            }

        });

    },
    deleteProduct: (productId) => {

        return new Promise( async (resolve, reject) => {

            try{

                //Function find the product document to delete from MongoDb collection
                const productToRemove = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) });

                // Function to Delete the image file from the server using fs.unlink
                productToRemove.images.forEach((image) => {

                    let imagePath = './public/product-images/' + image;
    
                    fs.unlink(imagePath, (error) => {
        
                        if (error) {
            
                            console.error("Error-1 from fs.unlink fuction at deleteProduct product-helpers: ", error);
            
                        }
        
                    })

                });

                //Function to delete the document from MongoDb collection
                const removeProduct = await db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(productId) });

                resolve(removeProduct);

            }catch(error){
            
                console.error("Error from deleteProduct product-helpers: ", error);
            
                reject(error);
            
            }

        });

    },
    getProductDetails:(productId)=>{

        return new Promise((resolve,reject)=>{

            try{

                db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectId(productId)}).then((product)=>{

                    resolve(product);
    
                })
            
            }catch(error){
            
                console.error("Error from getProductDetails product-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    updateProduct:(productId,productDetails)=>{

        return new Promise((resolve,reject)=>{

            try{

                db.get().collection(collections.PRODUCT_COLLECTION)
                .updateOne({_id:ObjectId(productId)},{
                    $set:{
                        id:productDetails.id,
                        name:productDetails.name,
                        category:productDetails.category,
                        description:productDetails.description,
                        price:productDetails.price
                    }
                }
                ).then(()=>{
    
                    resolve();
    
                })

            }catch(error){
            
                console.error("Error from updateProduct product-helpers: ", error);
            
                reject(error);
            
            }

        })

    },
    getProductCategoryById: (productID) => {

        return new Promise((resolve, reject) => {

          try {

                db.get().collection(collections.PRODUCT_COLLECTION)
                .findOne({ _id: ObjectId(productID) })
                .then((product) => {

                    if (product) {

                        db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION)
                        .findOne({ _id: ObjectId(product.category) })
                        .then((category) => {
                            if (category) {

                                const result = {
                                    _id: category._id,
                                    name: category.name
                                };

                                resolve(result);

                            } else {

                                resolve(null); // Category not found

                            }
                        })
                        .catch((error) => {

                            console.error("Error-1 from db promise at getProductCategoryById product-helpers: ", error);

                            reject(error);

                        });

                    } else {

                        resolve(null); // Product not found

                    }
                
                })
                .catch((error) => {

                    console.error("Error-2 from db promise at getProductCategoryById product-helpers: ", error);

                    reject(error);

                });

            } catch (error) {

                console.error("Error from getProductCategoryById product-helpers: ", error);

                reject(error);

            }

        });

    }

}