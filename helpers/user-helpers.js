const db = require("../config/connection");
const collections = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports = {

    doSignup:(userData)=>{

        return new Promise(async (resolve,reject)=>{

            userData.password = await bcrypt.hash(userData.password,10);

            const userCollection = db.get().collection(collections.USER_COLLECTION);

            userCollection.insertOne(userData).then((insertResult)=>{

                const insertedId = insertResult.insertedId;

                userCollection.findOne({_id: insertedId}).then((user)=>{

                    resolve(user);

                })

            })

        })

    }

}
