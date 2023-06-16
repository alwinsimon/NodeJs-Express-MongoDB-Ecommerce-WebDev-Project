const db = require("../config/externalConnectionsConfig");
const collections = require('../config/databaseCollectionsConfig')
const bcrypt = require('bcrypt');
const ObjectId = require("mongodb").ObjectId;
const path = require('path');
const fs = require('fs');
const paymentGateway = require("../config/externalConnectionsConfig");
const moment = require('moment-timezone'); // Module to modify the time to various time zones

require('dotenv').config(); // Module to Load environment variables from .env file





module.exports = {

  doAdminLogin:(loginFormData)=>{

    let adminAuthenticationResponse = {};

    return new Promise( async (resolve,reject)=>{

      let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({email:loginFormData.email});

      if(admin){

        bcrypt.compare(loginFormData.password, admin.password).then((verificationData)=>{

          if(verificationData){

            adminAuthenticationResponse.status = true;

            adminAuthenticationResponse.adminData = admin;

            resolve(adminAuthenticationResponse);

          }else{

            adminAuthenticationResponse.status = false;

            adminAuthenticationResponse.passwordError = true;

            resolve(adminAuthenticationResponse);

          }

        })

      }else{

        adminAuthenticationResponse.status = false;

        adminAuthenticationResponse.emailError = true;

        resolve(adminAuthenticationResponse);

      }

    })

  },
  addNewAdmin:(newAdminDetails)=>{

    return new Promise( async (resolve,reject)=>{

      newAdminDetails.password = await bcrypt.hash(newAdminDetails.password, 10);

      db.get().collection(collections.ADMIN_COLLECTION).insertOne(newAdminDetails).then((result)=>{

        resolve(result._insertedId);

      })

    });

  },
  addProductCategory:(categoryDetails)=>{

    return new Promise((resolve,reject)=>{

      db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION)
      .insertOne(categoryDetails).then((response)=>{

        resolve(response.insertedId);

      })
      .catch((err)=>{

        if(err){

          console.log(err);

          reject(err);
            
        }
              
      });

    })

  },
  checkProductCategoryExists: (categoryName)=>{

    return new Promise( async (resolve,reject)=>{

      let productCategory = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).find({name:categoryName}).toArray();

      if(productCategory[0]){  // Product category already exist in DB

        let response = {
          status:true,
          message: "Product Category Already Exists - New category Addition FAILED"
        }

        resolve(response);

      }else{ // Product category DOSEN'T exist in DB

        let response = {
          status:false,
          message: "Product Category Dosen't Exist"
        }

        resolve(response);

      }

    })

  },
  getProductCategories: () => {

    return new Promise(async (resolve, reject) => {

      try {

        let productCategories = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).find({}).toArray();
  
        productCategories = productCategories.map(category => { // For Converting the time from DB to IST

          const createdOnIST = moment(category.createdOn)
          .tz('Asia/Kolkata')
          .format('DD-MMM-YYYY h:mm A');
  
          return { ...category, createdOn: createdOnIST + ' IST' };

        });
  
        resolve(productCategories);

      } catch (error) {

        reject(error);

      }

    });

  },
  getProductCategoryDetails: (categoryId) => {

    return new Promise( async (resolve, reject) => {

      try {

        let categoryDetails = await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).findOne({_id:ObjectId(categoryId)});

        resolve(categoryDetails);

      } catch (error) {

        reject(error);

      }

    });

  },
  updateProductCategory: (categoryId, newData)=>{

    return new Promise( async (resolve, reject) => {

      try {

        await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).updateOne({_id:ObjectId(categoryId)}, {$set:newData}).then((result)=>{

          resolve(result);

        })
  

      } catch (error) {

        reject(error);

      }

    });

  },
  deleteProductCategory : (categoryId)=>{

    return new Promise( async (resolve, reject) => {

      try {

        await db.get().collection(collections.PRODUCT_CATEGORY_COLLECTION).deleteOne({_id:ObjectId(categoryId)}).then((result)=>{

          let imageId = categoryId;

          // Defining the path of the product image to be deleted
          const imageName = imageId.concat('.jpg')
          const imagePath = path.join(__dirname, '..', 'public', 'product-category-images', imageName);

          // Function to Delete the image file from the server using the above defined path
          fs.unlink(imagePath, (err) => {

            if (err) {

              reject(err);

              console.error(`Error deleting file ${imagePath}: ${err}`);

            }else{

              resolve(result);

            }
              
          });

        })
  

      } catch (error) {

        reject(error);

      }

    });

  },
  getAllUsers : ()=>{

    return new Promise( async (resolve, reject) => {

      try {

        let platformUsers = await db.get().collection(collections.USER_COLLECTION).find({}).toArray();

        platformUsers = platformUsers.map(user => {

          const joinedOnIST = moment(user.joinedOn).tz('Asia/Kolkata').format('DD-MMM-YYYY h:mm A');
        
          return { ...user, joinedOn: joinedOnIST + ' IST' };
          
        });
        
        resolve(platformUsers);
  

      } catch (error) {

        reject(error);

      }

    });

  },
  changeUserBlockStatus : (userId)=>{

    return new Promise( async (resolve, reject) => {

      try {

        let user = await db.get().collection(collections.USER_COLLECTION).findOne({_id:ObjectId(userId)});

        if(user.blocked){ // If the user is already blocked => UN-BLOCK

          await db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(userId)}, {$set:{blocked:false}}).then((result)=>{

            resolve(result);
  
          })

        }else{ // If the user is NOT BLOCKED => BLOCK

          await db.get().collection(collections.USER_COLLECTION).updateOne({_id:ObjectId(userId)}, {$set:{blocked:true}}).then((result)=>{

            resolve(result);
  
          })

        }

      } catch (error) {

        reject(error);

      }

    });

  },
  getAllOrders : ()=>{

    return new Promise( async (resolve, reject) => {

      try {

        let platformOrders = await db.get().collection(collections.ORDERS_COLLECTION).find({}).toArray();

        platformOrders = platformOrders.map(order => {

          const { date, ...rest } = order;

          const orderedAtIST = moment(date).tz('Asia/Kolkata').format('DD-MMM-YYYY h:mm A');

          return { ...rest, date: orderedAtIST + ' IST' };
          
        });

        // console.log(platformOrders);
        
        resolve(platformOrders);
  

      } catch (error) {

        reject(error);

      }

    });

  }
      
      

}