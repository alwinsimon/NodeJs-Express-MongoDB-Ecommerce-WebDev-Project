const db = require("../config/connection");
const collections = require('../config/collections')


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

    }

}