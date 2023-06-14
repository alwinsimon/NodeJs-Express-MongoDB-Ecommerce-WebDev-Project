require('dotenv').config(); // Module to Load environment variables from .env file


/*========================================================================================================================
                    ==================== Database Connection Configuration ====================
========================================================================================================================== */

const mongoClient = require('mongodb').MongoClient;

const state = {

    db:null

}


module.exports.connect = function (done){

    const url = process.env.MONGO_DB_URL;

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
========================================================================================================================== */

const Razorpay = require('razorpay');

module.exports.razorpayInstance = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_SECRET_KEY

})


/*========================================================================================================================
                ==================== TWILIO Messaging Gateway Connection Configuration to export ====================
========================================================================================================================== */

const twilio = require('twilio') (process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const verifySid = process.env.TWILIO_VERIFY_SID;

module.exports.sendOTPwithTwilio = twilio.verify.v2.services(verifySid).verifications.create;

module.exports.verifyOTPwithTwilio = twilio.verify.v2.services(verifySid).verificationChecks.create;

