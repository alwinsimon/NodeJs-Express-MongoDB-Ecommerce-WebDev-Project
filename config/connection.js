/*========================================================================================================================
                    ==================== Database Connection Configuration ====================
  ======================================================================================================================== */

var mongoClient = require('mongodb').MongoClient;

const state = {
    db:null
}


module.exports.connect = function (done){

    const url = 'mongodb://127.0.0.1:27017';

    const dbname = 'shopping';

    mongoClient.connect(url,(err,data)=>{

        if(err) return done(err);

        state.db = data.db(dbname);

        done();

    })

}

module.exports.get = function (){

    return state.db;

}


/*========================================================================================================================
                  ==================== Payment Gateway Connection Configuration to export ====================
  ======================================================================================================================== */

  const Razorpay = require('razorpay');

  require('dotenv').config(); // Module to Load environment variables from .env file

  module.exports.razorpayInstance = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_SECRET_KEY

  })