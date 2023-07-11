const db = require("../config/externalConnectionsConfig");
const dataBasecollections = require('../config/databaseCollectionsConfig');
const ObjectId = require("mongodb").ObjectId;
const moment = require('moment-timezone'); // Module to modify the time to various time zones



/*========================================================================================================================
                       ==================== ADMIN SIDE PRODUCT OFFER HELPERS ====================
==========================================================================================================================*/

const setProductOffer = ( productId, percentageOffer )=>{

  return new Promise( async (resolve, reject)=>{

    try{

      const updateProductDetails = await db.get().collection(dataBasecollections.PRODUCT_COLLECTION).updateOne({_id:ObjectId(productId)}, { $set: { productOffer: percentageOffer } });

      resolve(updateProductDetails);

    }catch (error){

      console.error("Error from setProductOffer offer-helpers: ", error);

      reject(error);

    }

  })
    
}


/*========================================================================================================================
                       ==================== ADMIN SIDE CATEGORY OFFER HELPERS ====================
==========================================================================================================================*/

const setCategoryOffer = ( categoryId, percentageOffer )=>{

  return new Promise( async (resolve, reject)=>{

    try{

      percentageOffer = parseInt(percentageOffer);

      const updateCategoryDetails = await db.get().collection(dataBasecollections.PRODUCT_CATEGORY_COLLECTION).updateOne({_id:ObjectId(categoryId)}, { $set: { categoryOffer: percentageOffer } });

      resolve(updateCategoryDetails);

    }catch (error){

      console.error("Error from setCategoryOffer offer-helpers: ", error);

      reject(error);

    }

  })
    
}



/*========================================================================================================================
                       ==================== USER SIDE PRODUCT OFFER HELPERS ====================
==========================================================================================================================*/

const getCartItemsWithOfferData = async (userId) => {

  return new Promise( async (resolve, reject)=>{

    try {

      const cartItems = await db.get().collection(dataBasecollections.CART_COLLECTION).aggregate([

        { $match: { user: ObjectId(userId) } },
        { $unwind: "$products" },
        {
          $lookup: {
            from: dataBasecollections.PRODUCT_COLLECTION,
            localField: "products.item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            userId: userId,
            cartId: "$_id",
            productId: "$products.item",
            item: "$products.item",
            quantity: "$products.quantity",
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
        {
          $project: {
            userId: 1,
            cartId: 1,
            productId: 1,
            item: 1,
            quantity: 1,
            productName: "$product.name",
            productDescription: "$product.description",
            price: { $toInt: "$product.price" },
            discountPercentage: {
              $toInt: "$product.productOffer",
            },
            discountAmount: {
              $multiply: [
                { $divide: [{ $toInt: "$product.price" }, 100] },
                { $toInt: "$product.productOffer" },
                "$quantity",
              ],
            },
          },
        }

      ]).toArray();

  
      // Creating a object for each cart product with all the necessary data and the discounts calculated.
      const cartItemsWithOfferData = cartItems.map((item) => {

        const totalAmount = item.quantity * item.price;
        const finalAmount = totalAmount - item.discountAmount;
  
        return {

          userId: item.userId,
          cartId: item.cartId,
          productId: item.productId,
          productName: item.productName,
          productDescription: item.productDescription,
          price: item.price,
          quantity: item.quantity,
          totalAmount,
          discountAmount: item.discountAmount,
          discountPercentage: item.discountPercentage,
          finalAmount: finalAmount

        };

      });
  
      resolve(cartItemsWithOfferData);

    } catch (error) {

      console.error("Error from getCartItemsWithOfferData offer-helpers: ", error);

      reject(error);

    }

  })

};


const calculateProductOfferDiscountsForCart = async (userId) => {

  return new Promise( async (resolve, reject)=>{

    try {

      const cartItems = await db.get().collection(dataBasecollections.CART_COLLECTION).aggregate([

        { $match: { user: ObjectId(userId) } },
        { $unwind: "$products" },
        {
          $lookup: {
            from: dataBasecollections.PRODUCT_COLLECTION,
            localField: "products.item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            productName: "$product.name",
            price: { $toInt: "$product.price" },
            discountPercentage: {
              $toInt: "$product.productOffer",
            },
          },
        }

      ]).toArray();
  
      const productDiscounts = {};
      let totalCartDiscount = 0;
  
      cartItems.forEach((item) => {

        const discountAmount = (item.quantity * item.price * item.discountPercentage) / 100;

        totalCartDiscount += discountAmount;
  
        if (!productDiscounts[item.productName]) {

          productDiscounts[item.productName] = discountAmount;

        } else {

          productDiscounts[item.productName] += discountAmount;

        }

      });
  
      const productDiscountsAndTotalCartDiscount = {

        productDiscounts,

        totalCartDiscount

      };
  
      resolve(productDiscountsAndTotalCartDiscount);

    } catch (error) {

      console.error("Error from calculateProductOfferDiscountsForCart offer-helpers: ", error);

      reject(error);

    }

  })

};




/*========================================================================================================================
                       ==================== ADMIN SIDE CATEGORY OFFER HELPERS ====================
==========================================================================================================================*/


/* ================================================ Add New Offer ================================================ */

const verifyOfferExist = (newOfferData)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const offerNameForVerification = newOfferData.offerName;

            const offerNameRegex = new RegExp(`^${offerNameForVerification}$`, 'i'); // Used for making an case insensitive search in DB
    
            const offerExist = await db.get().collection(dataBasecollections.OFFER_COLLECTION).findOne( { offerName : offerNameRegex } );
    
            if( offerExist === null ){

                resolve({status:true});

            }else{

                resolve({duplicateOffer:true});

            }
    
        }catch (error){
    
            console.error("Error from verifyOfferExist offer-helpers: ", error);

            reject(error);
    
        }

    })
    
}


const addNewOffer = (newOfferData, adminData)=>{

    return new Promise( async (resolve, reject)=>{

        try{ 

            newOfferData.usageCount = 0;

            if(newOfferData.activeOffer === "true"){

                newOfferData.activeOffer = true;

            }else if(newOfferData.activeOffer === "false"){

                newOfferData.activeOffer = false;

            }

            newOfferData.createdOn = new Date();

            const offerExpiryDate = new Date(newOfferData.createdOn.getTime());

            offerExpiryDate.setDate(offerExpiryDate.getDate() + parseInt(newOfferData.validFor));

            newOfferData.expiryDate = offerExpiryDate;
    
            newOfferData.createdBy = ObjectId(adminData._id);
    
            const OfferAddition = await db.get().collection(dataBasecollections.OFFER_COLLECTION).insertOne(newOfferData);
    
            resolve(OfferAddition);
    
        }catch (error){
    
            console.error("Error from addNewOffer offer-helpers: ", error);

            reject(error);
            
        }

    })
    
}

/* ================================================ Retrive Offer Data ================================================ */

const getActiveOffers = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{
    
            let activeOffers = await db.get().collection(dataBasecollections.OFFER_COLLECTION).find( {activeOffer:true} ).toArray();

            activeOffers = activeOffers.map(offers => { // For Converting the time from DB to IST
    
                const expiresOnIST = moment(offers.expiryDate)
                .tz('Asia/Kolkata')
                .format('DD-MMM-YYYY hh:mm:ss A');
        
                return { ...offers, expiryDate: expiresOnIST + " IST"};
  
            });
    
            resolve(activeOffers);
    
        }catch (error){
    
            console.error("Error from getActiveOffers offer-helpers: ", error);

            reject(error);
            
        }

    })
    
}

const getInActiveOffers = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{
    
            let inActiveOffers = await db.get().collection(dataBasecollections.OFFER_COLLECTION).find( {activeOffer:false} ).toArray();

            inActiveOffers = inActiveOffers.map(offers => { // For Converting the time from DB to IST
    
                const expiresOnIST = moment(offers.expiryDate)
                .tz('Asia/Kolkata')
                .format('DD-MMM-YYYY hh:mm:ss A');
        
                return { ...offers, expiryDate: expiresOnIST + " IST"};
  
            });
    
            resolve(inActiveOffers);
    
        }catch (error){
    
            console.error("Error from getInActiveOffers offer-helpers: ", error);

            reject(error);
            
        }

    })
    
}

const getSingleOfferData = (offerId)=>{

    return new Promise( async (resolve, reject)=>{

        try{
    
            const offerData = await db.get().collection(dataBasecollections.OFFER_COLLECTION).findOne( {_id : ObjectId(offerId) } );
    
            resolve(offerData);
    
        }catch (error){
    
            console.error("Error from getSingleOfferData offer-helpers: ", error);

            reject(error);
            
        }

    })
    
}


const getSingleOfferDataWithOfferName = (requestedOfferName)=>{

    return new Promise( async (resolve, reject)=>{

        try{
    
            const offerData = await db.get().collection(dataBasecollections.OFFER_COLLECTION).findOne( {offerName : requestedOfferName } );
    
            resolve(offerData);
    
        }catch (error){
    
            console.error("Error from getSingleOfferDataWithOfferName offer-helpers: ", error);

            reject(error);
            
        }

    })
    
}


/* ================================================ Edit Offer ================================================ */

const updateOfferData = (offerDataForUpdate, adminData)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            offerDataForUpdate.updatedBy = ObjectId(adminData._id);

            offerDataForUpdate.updatedOn = new Date();

            if(offerDataForUpdate.activeOffer === "true"){

                offerDataForUpdate.activeOffer = true;

            }else if(offerDataForUpdate.activeOffer === "false"){

                offerDataForUpdate.activeOffer = false;

            }

            const offerExpiryDate = new Date(offerDataForUpdate.updatedOn.getTime());

            offerExpiryDate.setDate(offerExpiryDate.getDate() + parseInt(offerDataForUpdate.validFor));

            offerDataForUpdate.expiryDate = offerExpiryDate;

            // Updating offer data in Database
            const dbQuery = { _id : ObjectId(offerDataForUpdate.offerId)};
            const dbAction = { $set : offerDataForUpdate};
    
            const offerUpdation = await db.get().collection(dataBasecollections.OFFER_COLLECTION).updateOne( dbQuery, dbAction );

            // Deleting the un-necessary offer Id feild inserted into Db after updating the db with new offer details.
            const dbQuery2 = { _id : ObjectId(offerDataForUpdate.offerId)};
            const updateQuery = { $unset: { offerId: "" } };
            const removeOfferIdFeild = await db.get().collection(dataBasecollections.OFFER_COLLECTION).updateOne(dbQuery2, updateQuery);
    
            resolve(offerUpdation);
    
        }catch (error){
    
            console.error("Error from updateOfferData offer-helpers: ", error);

            reject(error);
            
        }

    })
    
}

const changeOfferStatus = (offerDataForUpdate, statusToModify, adminData)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            offerDataForUpdate.statusModifiedBy = ObjectId(adminData._id);

            offerDataForUpdate.statusModifiedOn = new Date();

            if(statusToModify === "Activate"){

                offerDataForUpdate.activeOffer = true;

            }else if(statusToModify === "Deactivate"){

                offerDataForUpdate.activeOffer = false;

            }

            // Updating offer status in Database
            const dbQuery = { _id : ObjectId(offerDataForUpdate._id)};
            const dbAction = { $set : offerDataForUpdate};
    
            const offerStatusUpdation = await db.get().collection(dataBasecollections.OFFER_COLLECTION).updateOne( dbQuery, dbAction );
    
            resolve(offerStatusUpdation);
    
        }catch (error){
    
            console.error("Error from changeOfferStatus offer-helpers: ", error);

            reject(error);
            
        }

    })
    
}










/* ======================== Exporting Helpers ======================== */
module.exports = {

    addNewOffer,
    verifyOfferExist,
    getActiveOffers,
    getInActiveOffers,
    getSingleOfferData,
    updateOfferData,
    changeOfferStatus,
    getSingleOfferDataWithOfferName,
    setProductOffer,
    getCartItemsWithOfferData,
    calculateProductOfferDiscountsForCart,
    setCategoryOffer

}