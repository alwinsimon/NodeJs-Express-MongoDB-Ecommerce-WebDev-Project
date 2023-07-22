const db = require("../config/externalConnectionsConfig");
const databaseCollections = require('../config/databaseCollectionsConfig')
const ObjectId = require("mongodb").ObjectId;
const fs = require('fs');

require('dotenv').config(); // Module to Load environment variables from .env file




const getAllBannerImages = ()=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const bannerImages = await db.get().collection(databaseCollections.BANNER_IMAGE_COLLECTION).find({}).toArray();

            resolve(bannerImages);
    
        }catch (error){
    
            console.error("Error from getAllBannerImages bannerImage-helpers: ", error);

            reject(error);
    
        }

    })
    
}


const addNewBannerImage = (bannerImageData)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            const insertBannerImageToDB = await db.get().collection(databaseCollections.BANNER_IMAGE_COLLECTION).insertOne(bannerImageData);

            resolve(insertBannerImageToDB);
    
        }catch (error){
    
            console.error("Error from addNewBannerImage bannerImage-helpers: ", error);

            reject(error);
    
        }

    })
    
}


const removeBannerImage = (bannerImageId)=>{

    return new Promise( async (resolve, reject)=>{

        try{

            //Function find the banner image document to delete from MongoDb collection
            const bannerImageToRemove = await db.get().collection(databaseCollections.BANNER_IMAGE_COLLECTION).findOne({ _id: ObjectId(bannerImageId) });

            // Function to Delete the image file from the server using fs.unlink
            const image = bannerImageToRemove.bannerImage;
            const imagePath = './public/banner-images/' + image;

            fs.unlink(imagePath, (error) => {

                if (error) {

                    console.error("Error-1 from fs.unlink function at removeBannerImage bannerImage-helpers: ", error);

                }

            })

            const removeBannerImageFromDB = await db.get().collection(databaseCollections.BANNER_IMAGE_COLLECTION).deleteOne({ _id: ObjectId(bannerImageId) });

            resolve(removeBannerImageFromDB);
    
        }catch (error){
    
            console.error("Error from removeBannerImage bannerImage-helpers: ", error);

            reject(error);
    
        }

    })
    
}













module.exports = {

    getAllBannerImages,
    addNewBannerImage,
    removeBannerImage

}