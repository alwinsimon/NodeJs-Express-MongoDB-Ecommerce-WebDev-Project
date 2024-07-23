# GetMyDeal

Welcome to GetMyDeal, your ultimate destination for discovering and securing incredible deals online! Whether you're a savvy shopper looking for discounts or a merchant seeking a reliable e-commerce platform, GetMyDeal has you covered.

## Table of Contents

- [About GetMyDeal](#about-getmydeal)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [CI/CD Pipeline](#ci-cd-pipeline)
- [Essential Environment Variables](#essential-environment-variables)
- [License](#license)

## About GetMyDeal

GetMyDeal is an innovative e-commerce platform built with the user in mind. We've harnessed the power of the MVC (Model-View-Controller) architectural pattern to deliver a seamless shopping experience. Here's what sets us apart:

- **User-Centric Features:** We prioritize your security and convenience with features like secure authentication, dynamic product listings, and efficient cart management.

- **Admin Empowerment:** For administrators, we offer intuitive product and category management, coupon customization, and comprehensive sales analytics.

- **Ongoing Improvement:** GetMyDeal is committed to continuously enhancing your shopping experience. Expect exciting updates and new features in the future.

## Features

- **User Authentication:** Enjoy secure and hassle-free authentication with email verification and OTP (One-Time Password) login, powered by Twilio.

- **Dynamic Product Listings:** Discover a vast array of products, neatly categorized for effortless browsing.

- **Cart Management:** Effortlessly manage your shopping cart and apply exclusive offers and coupons.

- **Order Management:** Keep track of your orders in real-time, and benefit from efficient order status updates.

- **Coupon Management:** Find personalized savings with admin-managed coupons and special offers.

- **Address Management:** Simplify delivery by managing your addresses and setting a default location.

- **Wallet Payments:** Seamlessly make payments from your wallet and track transactions transparently.

- **Secure Cart Functionality:** A secure shopping experience where logged-in users can add items without page reloads.

- **Error Handling:** Graceful error handling and secure session management ensure uninterrupted shopping.

- **User Profile Management:** Personalize your account with profile editing and image uploads.

- **Admin Empowerment:** Admins can easily manage products, categories, offers, coupons, and gain insights through the dashboard.

## Technologies Used

GetMyDeal leverages cutting-edge technologies to provide a secure and efficient shopping experience:

- **MongoDB Native Driver:** We use the MongoDB native driver to manage our database efficiently. This ensures robust data storage and retrieval, enhancing the overall performance of our platform.

- **Razorpay Payment Gateway:** For seamless and secure payments, we've integrated the Razorpay payment gateway. It allows users to make transactions with confidence and is a trusted solution for handling payments.

- **Twilio:** Twilio powers our OTP (One-Time Password) verification system during login, adding an extra layer of security to your account.

- **GitHub Actions:** Our CI/CD pipeline is powered by GitHub Actions. With this automation tool, we ensure that code changes are rigorously tested and seamlessly deployed, keeping GetMyDeal up and running smoothly.

- **Node.js:** GetMyDeal is built on Node.js, providing a scalable and efficient backend for our application. Node.js enables us to handle a large number of users and transactions with ease.

- **Express.js:** We use Express.js, a fast and minimalist web framework for Node.js, to handle our application's routing and middleware, making development more efficient.

## Getting Started

Ready to explore GetMyDeal? Here's how to get started:

### Installation

1. Clone this repository.
2. Run `npm install` to install all the necessary dependencies.

### Usage

1. Configure your environment settings by setting up the essential environment variables mentioned in the [Essential Environment Variables](#essential-environment-variables) section.
2. Run `npm start` to start the project. For development environments, you can use `npm run dev` for convenient development with automatic code reloading.

## CI/CD Pipeline

We've integrated a robust CI/CD (Continuous Integration and Continuous Deployment) pipeline using GitHub Actions. This ensures that our code is thoroughly tested and deployed automatically, providing a seamless and reliable experience for our users. With every code change, our pipeline:

- Runs automated tests to catch issues early.
- Builds and packages the application.
- Deploys updates to our production environment when changes pass all tests.

This ensures that GetMyDeal is always up-to-date, stable, and ready to provide you with the best shopping experience.

## Essential Environment Variables

To run GetMyDeal smoothly, you'll need to set up the following essential environment variables in your environment configuration or .env file. These variables are critical for the proper functioning of the application:

### Server Port

- **PORT:** The port on which the GetMyDeal server should listen. Example: `PORT=3000`

### MongoDB Url

- **MONGO_DB_URL:** The URL for connecting to your MongoDB database. Example: `MONGO_DB_URL=mongodb://localhost:27017/getmydeal`

### Platform Name

- **PLATFORM_NAME:** The name of your platform, which is displayed in various parts of the application. Example: `PLATFORM_NAME=GetMyDeal`

### Cookie Key

- **SESSION_SECRET_KEY:** A secret key for session management and security. Example: `SESSION_SECRET_KEY=mysecretkey`

### Payment Gateway Credentials - Razorpay

- **RAZORPAY_KEY_ID:** Your Razorpay API Key ID for payment processing. Example: `RAZORPAY_KEY_ID=your-key-id`
- **RAZORPAY_SECRET_KEY:** Your Razorpay API Secret Key for payment processing. Example: `RAZORPAY_SECRET_KEY=your-secret-key`

### OTP Verification Service Credentials - Twilio

- **TWILIO_ACCOUNT_SID:** Your Twilio Account SID for OTP verification. Example: `TWILIO_ACCOUNT_SID=your-account-sid`
- **TWILIO_AUTH_TOKEN:** Your Twilio Authentication Token for OTP verification. Example: `TWILIO_AUTH_TOKEN=your-auth-token`
- **TWILIO_VERIFY_SID:** Your Twilio Verify Service SID for OTP verification. Example: `TWILIO_VERIFY_SID=your-verify-sid`

Make sure to securely manage these environment variables to ensure the security and proper functioning of GetMyDeal. You can add them to your application's environment configuration or use a tool like `.env` files to manage them conveniently.

---

Thank you for visiting the repository, Happy coding!
