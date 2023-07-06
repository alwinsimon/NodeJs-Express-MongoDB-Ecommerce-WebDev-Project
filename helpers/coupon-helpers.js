const db = require("../config/externalConnectionsConfig");
const dataBasecollections = require('../config/databaseCollectionsConfig');
const ObjectId = require("mongodb").ObjectId;



/*========================================================================================================================
                       ==================== ADMIN SIDE COUPON HELPERS ====================
==========================================================================================================================*/


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







/*========================================================================================================================
                       ==================== USER SIDE COUPON HELPERS ====================
==========================================================================================================================*/


const getCouponDataByCouponCode = (couponCode)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            // Check if coupon Exist or not
            const dbCouponQuery = { couponCode : couponCode};
            const couponData = await db.get().collection(dataBasecollections.COUPON_COLLECTION).findOne( dbCouponQuery );

            if(couponData === null){

                resolve({ couponNotFound : true});

            }else{

                resolve(couponData);

            }
    
        }catch (error){
    
            console.log("Error from getCouponDataByCouponCode couponHelper :", error);

            reject(error);
            
        }

    })
    
}


const verifyCouponEligibility = (requestedCouponCode, userData)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            // Check if coupon Exist or not
            const dbCouponQuery = { couponCode : requestedCouponCode};
            const couponData = await db.get().collection(dataBasecollections.COUPON_COLLECTION).findOne( dbCouponQuery );

            if(couponData === null){

                resolve({ status: false, reasonForRejection: "Coupon code dosen't exist"});

            }else{

                if(couponData.activeCoupon){

                    const couponExpiryDate = new Date(couponData.createdOn.getTime());

                    couponExpiryDate.setDate(couponExpiryDate.getDate() + parseInt(couponData.validFor));

                    const currentDate = new Date();

                    if(couponExpiryDate >= currentDate){

                        resolve({ status: true });

                    }else{

                        resolve({ status: false, reasonForRejection: "Coupon code expired"});

                    }

                }else{

                    resolve({ status: false, reasonForRejection: "Coupon currently un-available"});

                }

            }
    
        }catch (error){
    
            console.log("Error from updateCouponData couponHelper :", error);

            reject(error);
            
        }

    })
    
}


const verifyCouponUsedStatus = (userId, couponId)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            // Check if coupon Exist or not
            const dbQuery = {

                userId: userId,
                
                usedCoupons: { $elemMatch: { couponId, usedCoupon: true }}

            };

            const previouslyUsedCoupon = await db.get().collection(dataBasecollections.USED_COUPON_COLLECTION).findOne(dbQuery);

            if(previouslyUsedCoupon === null){ // Coupon is not used ever

                resolve( { status : true} );

            }else{ // Coupon is used already

                resolve({ status : false});

            }
    
        }catch (error){
    
            console.log("Error from verifyCouponUsedStatus couponHelper :", error);

            reject(error);
            
        }

    })
    
}


const applyCouponToCart = (userId, couponId)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            // Step-1 ==> Disable any other coupons that have been applied earlier
            const dbQuery = { userId: userId, usedCoupons: { $elemMatch: { appliedCoupon: true } } };

            const updateQuery = { $set: { "usedCoupons.$[elem].appliedCoupon": false } };

            const arrayFilters = [ { "elem.appliedCoupon" : true } ];
        
            const updateOptions = { arrayFilters: arrayFilters };

            const updateResult = await db.get().collection(dataBasecollections.USED_COUPON_COLLECTION).updateMany(dbQuery, updateQuery, updateOptions);

            // console.log("============================================================",updateResult);

            // Step-2 ==> Add the given coupon to users coupon history
            const userCouponHistory = await db.get().collection(dataBasecollections.USED_COUPON_COLLECTION).findOne( { userId : userId } );

            if(userCouponHistory === null){ // If the user have no document in the coupons history collection

                const dataToInsert = {

                    userId : userId,

                    usedCoupons:[{

                        couponId : couponId,
                        
                        appliedCoupon : true,

                        usedCoupon : false

                    }]

                }

                const insertNewCouponHistory = await db.get().collection(dataBasecollections.USED_COUPON_COLLECTION).insertOne( dataToInsert );

                // console.log("#######################################################", insertNewCouponHistory);

                resolve({status:true});

            }else{ // If the user has a document in the coupons history collection, but don't have this coupon or this coupon is not applied yet


                const dbQuery = { userId: userId, usedCoupons: { $elemMatch: { couponId : couponId} } };

                const couponObjectExist = await db.get().collection(dataBasecollections.USED_COUPON_COLLECTION).findOne( dbQuery );

                if(couponObjectExist === null ){ // Object containing Coupon code dosen't exist in the used coupons array

                    const dbQuery = { userId: userId };

                    const dbInsert = { $push: { usedCoupons: {couponId: couponId, appliedCoupon: true, usedCoupon: false } } };

                    const couponObjectExist = await db.get().collection(dataBasecollections.USED_COUPON_COLLECTION).updateOne( dbQuery, dbInsert );

                    // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", couponObjectExist);

                    resolve({status:true});

                }else{ // Object containing Coupon code exist in the used coupons array, so update the applied coupon feild in the array object to true

                    const dbQuery = { userId: userId, usedCoupons: { $elemMatch: { couponId : couponId } } };

                    const dbUpdate = { $set: { "usedCoupons.$.appliedCoupon": true } };

                    const couponObjectModified = await db.get().collection(dataBasecollections.USED_COUPON_COLLECTION).updateOne( dbQuery, dbUpdate );

                    // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", couponObjectModified);

                    resolve({status:true});

                }

            }

    
        }catch (error){
    
            console.log("Error from applyCouponToCart couponHelper :", error);

            reject(error);
            
        }

    })
    
}









/* ======================== Exporting Helpers ======================== */
module.exports = {

    /*=== Admin Coupon Helpers ===*/
    addNewCoupon,
    verifyCouponExist,
    getActiveCoupons,
    getInActiveCoupons,
    getSingleCouponData,
    updateCouponData,
    changeCouponStatus,

    /*=== Useer Coupon Controllers ===*/
    verifyCouponEligibility,
    getCouponDataByCouponCode,
    verifyCouponUsedStatus,
    applyCouponToCart

}