const db = require("../config/connection");
const collections = require('../config/collections');
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
    getAllProducts:()=>{

        return new Promise(async (resolve,reject)=>{

            let products = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()

            resolve(products);

        })

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

                console.log(deleteResult);

                resolve();

            });

        });

    }

}