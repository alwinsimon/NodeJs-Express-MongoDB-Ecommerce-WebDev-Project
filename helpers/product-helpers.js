const db = require("../config/externalConnectionsConfig");
const collections = require('../config/databaseCollectionsConfig');
const ObjectId = require("mongodb").ObjectId;
const path = require('path');
const fs = require('fs');



module.exports = {

    addProduct:(product,callback)=>{

        db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data)=>{

            callback(data);
            /*In the above line, we are passing the object named data.
            This object  is obtained as a result of calling .then in the promise returned by the insertOne function of MongoDb.
            This object has a key namely insertedId this is the insert id of document created in the db.
            We send it back as an argument of the callback in admin.js where this function was called.
            There this id is utilised for setting the name of uploaded image so that,
            we can establish a relation between each product document in db and its image in server
            */
            
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
                };

                });
        
                // console.log(result);
                
                resolve(result);

            } catch (error) {

                console.log(error);

                reject(error);

            }

        });

    },
    deleteProduct: (productId, image) => {

        return new Promise((resolve, reject) => {

            //Function to delete the document from MongoDb collection
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(productId) }).then((deleteResult) => {

                // Defining the path of the product image to be deleted
                const imageName = image.concat('.jpg')
                const imagePath = path.join(__dirname, '..', 'public', 'product-images', imageName);

                // Function to Delete the image file from the server using the above defined path
                fs.unlink(imagePath, (err) => {

                    if (err) {
                        console.error(`Error deleting file ${imagePath}: ${err}`);
                    }
                    
                });

                // console.log(deleteResult);

                resolve();

            });

        });

    },
    getProductDetails:(productId)=>{

        return new Promise((resolve,reject)=>{

            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:ObjectId(productId)}).then((product)=>{

                resolve(product);

            })

        })

    },
    updateProduct:(productId,productDetails)=>{

        return new Promise((resolve,reject)=>{

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

                            reject(error);

                        });

                    } else {

                        resolve(null); // Product not found

                    }
                
                })
                .catch((error) => {

                    reject(error);

                });

            } catch (error) {

                reject(error);

            }

        });

    }
      
      
      
      

}