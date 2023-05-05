const db = require("../config/connection");


module.exports = {

    addProduct:(product,callback)=>{

        db.get().collection('products').insertOne(product).then((data)=>{

            callback(data);
            /*In the above line, we are passing the object named data.
            This object  is obtained as a result of calling .then in the promise returned by the insertOne function of MongoDb.
            This object has a key namely insertedId this is the insert id of document created in the db.
            We send it back as an argument of the callback in admin.js where this function was called.
            There this id is utilised for setting the name of uploaded image so that,
            we can establish a relation between each product document in db and its image in server
            */
            
        })

    }

}