const db = require("../config/externalConnectionsConfig");
const dataBasecollections = require('../config/databaseCollectionsConfig');
const ObjectId = require("mongodb").ObjectId;




/* ================================================ Add New Coupon ================================================ */

const verifyCouponExist = (newCouponData)=>{

    return new Promise( async (resolve, reject)=>{

        const couponCodeForVerification = newCouponData.couponCode.toLowerCase();

        try{
    
            const couponExist = await db.get().collection(dataBasecollections.COUPON_COLLECTION).find( { couponCode: couponCodeForVerification } ).toArray();
    
            if(couponExist.length === 0){

                resolve({status:true});

            }else{

                resolve({duplicateCoupon:true});
            }
    
        }catch (error){
    
            console.log("Error from verifyCouponExist couponHelper :", error);

            reject(error);
    
        }

    })
    
}


const addNewCoupon = (newCouponData, adminData)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            newCouponData.couponCode = newCouponData.couponCode.toLowerCase(); 
            // Converting the coupon code to lowercase to maintain uniform storage of codes and avoid duplicates due to vatiation in uppercase/lowercase

            newCouponData.usageCount = 0;

            if(newCouponData.activeCoupon === "true"){

                newCouponData.activeCoupon = true;

            }else if(newCouponData.activeCoupon === "false"){

                newCouponData.activeCoupon = false;

            }

            newCouponData.createdOn = new Date();
    
            newCouponData.createdBy = ObjectId(adminData._id);
    
            const couponAddition = await db.get().collection(dataBasecollections.COUPON_COLLECTION).insertOne(newCouponData);
    
            resolve(couponAddition);
    
        }catch (error){
    
            console.log("Error from addNewCoupon couponHelper :", error);

            reject(error);
            
        }

    })
    
}

/* ================================================ Retrive Coupon Data ================================================ */

const getActiveCoupons = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{
    
            const activeCoupons = await db.get().collection(dataBasecollections.COUPON_COLLECTION).find( {activeCoupon:true} ).toArray();
    
            resolve(activeCoupons);
    
        }catch (error){
    
            console.log("Error from getActiveCoupons couponHelper :", error);

            reject(error);
            
        }

    })
    
}

const getInActiveCoupons = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{
    
            const inActiveCoupons = await db.get().collection(dataBasecollections.COUPON_COLLECTION).find( {activeCoupon:false} ).toArray();
    
            resolve(inActiveCoupons);
    
        }catch (error){
    
            console.log("Error from getInActiveCoupons couponHelper :", error);

            reject(error);
            
        }

    })
    
}

const getSingleCouponData = (couponId)=>{

    return new Promise( async (resolve, reject)=>{

        try{
    
            const couponData = await db.get().collection(dataBasecollections.COUPON_COLLECTION).findOne( {_id : ObjectId(couponId) } );
    
            resolve(couponData);
    
        }catch (error){
    
            console.log("Error from getSingleCouponData couponHelper :", error);

            reject(error);
            
        }

    })
    
}


/* ================================================ Edit Coupon ================================================ */

const updateCouponData = (couponDataForUpdate, adminData)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            couponDataForUpdate.couponCode = couponDataForUpdate.couponCode.toLowerCase(); 
            // Converting the coupon code to lowercase to maintain uniform storage of codes and avoid duplicates due to vatiation in uppercase/lowercase

            couponDataForUpdate.updatedBy = ObjectId(adminData._id);

            couponDataForUpdate.updatedOn = new Date();

            if(couponDataForUpdate.activeCoupon === "true"){

                couponDataForUpdate.activeCoupon = true;

            }else if(couponDataForUpdate.activeCoupon === "false"){

                couponDataForUpdate.activeCoupon = false;

            }

            // Updating coupon data in Database
            const dbQuery = { _id : ObjectId(couponDataForUpdate.couponId)};
            const dbAction = { $set : couponDataForUpdate};
    
            const couponUpdation = await db.get().collection(dataBasecollections.COUPON_COLLECTION).updateOne( dbQuery, dbAction );

            // Deleting the un-necessary coupon Id feild inserted into Db after updating the db with new coupon details.
            const dbQuery2 = { _id : ObjectId(couponDataForUpdate.couponId)};
            const updateQuery = { $unset: { couponId: "" } };
            const removeCouponIdFeild = await db.get().collection(dataBasecollections.COUPON_COLLECTION).updateOne(dbQuery2, updateQuery);
    
            resolve(couponUpdation);
    
        }catch (error){
    
            console.log("Error from updateCouponData couponHelper :", error);

            reject(error);
            
        }

    })
    
}

const changeCouponStatus = (couponDataForUpdate, statusToModify, adminData)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            couponDataForUpdate.statusModifiedBy = ObjectId(adminData._id);

            couponDataForUpdate.statusModifiedOn = new Date();

            if(statusToModify === "Activate"){

                couponDataForUpdate.activeCoupon = true;

            }else if(statusToModify === "Deactivate"){

                couponDataForUpdate.activeCoupon = false;

            }

            // Updating coupon status in Database
            const dbQuery = { _id : ObjectId(couponDataForUpdate._id)};
            const dbAction = { $set : couponDataForUpdate};
    
            const couponStatusUpdation = await db.get().collection(dataBasecollections.COUPON_COLLECTION).updateOne( dbQuery, dbAction );
    
            resolve(couponStatusUpdation);
    
        }catch (error){
    
            console.log("Error from updateCouponData couponHelper :", error);

            reject(error);
            
        }

    })
    
}












module.exports = {

    addNewCoupon,
    verifyCouponExist,
    getActiveCoupons,
    getInActiveCoupons,
    getSingleCouponData,
    updateCouponData,
    changeCouponStatus

}