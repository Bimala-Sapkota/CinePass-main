# CinePass - Movie Ticket Booking System

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" alt="Node.js"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React"></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB"></a>
</p>


CinePass is a comprehensive movie ticket booking system specifically designed for the Nepali market. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it offers a seamless movie booking experience with local payment gateway integrations, bilingual support, and PWA capabilities.

## ✨ Features

- 🎟️ **Complete Booking System** - Browse movies, select seats, and book tickets
- 💳 **Local Payment Integration** - Khalti and eSewa payment gateways
- 🌐 **Bilingual Support** - English and Nepali language support
- 🎭 **Admin Dashboard** - Complete theater and movie management
- 🔐 **Secure Authentication** - JWT-based auth with role management
- 🎬 **Movie Trailers** - Integrated trailer viewing system
- 📧 **Email Notifications** - Booking confirmations and updates
- ⭐ **Review System** - Movie ratings and reviews
- 🎯 **Recommendations** - Personalized movie suggestions
- 📊 **Analytics Dashboard** - Sales and engagement analytics

## 🏗️ Project Structure

```
CinePass/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── services/      # API services
│   │   └── assets/        # Static assets
│   ├── public/            # PWA assets
│   └── package.json
│
├── server/                # Backend (Node.js + Express)
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── package.json
│
└── README.md
```

## 🛠️ Technology Stack

### Frontend

- **React 19** - Component-based UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Icons** - Icon library
- **JWT Decode** - Token handling

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service

### External Services

- **Cloudinary** - Image and media storage
- **Khalti & eSewa** - Payment gateways
- **Gmail SMTP** - Email delivery

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Gmail account for SMTP
- Khalti/eSewa merchant accounts (for payments)

### 1. Clone the Repository

```bash
git clone https://github.com/sandip387/CinePass.git
cd CinePass
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create .env file in the server directory:

```
# Server Configuration
NODE_ENV=development
PORT=8000
CORS_ORIGIN=http://localhost:5173
APP_BASE_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/CinePass?retryWrites=true&w=majority
MONGODB_PASSWORD=your_mongodb_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_TOKEN_EXPIRE=10d
JWT_COOKIE_EXPIRE=10

# Khalti Configuration
KHALTI_BASE_URL=https://dev.khalti.com/api/v2/epayment/initiate/
KHALTI_PUBLIC_KEY=your_khalti_public_key
KHALTI_SECRET_KEY=your_khalti_secret_key

# eSewa Configuration
ESEWA_SECRET_KEY=your_esewa_secret_key
ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_FORM_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_STATUS_CHECK_URL=https://rc.esewa.com.np/api/epay/transaction/status/

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_gmail@gmail.com
EMAIL_ADMIN=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

Start the backend server:

```
node --watch app.js
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```
cd ../client
npm install
```

Create a `.env.local` file in the client directory:

```
VITE_API_URL=http://localhost:8000/api
VITE_API_BASE_URL=http://localhost:8000
```

Add PWA icons to the public directory:

- pwa-192x192.png (192x192px)
- pwa-512x512.png (512x512px)

Start the frontend development server:

```
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📝 API Documentation

**Authentication Endpoints**

```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/logout            # User logout
GET  /api/auth/me                # Get current user
POST /api/auth/forgotpassword    # Password reset request
PUT  /api/auth/resetpassword/:token  # Reset password
```

**Movie Endpoints**

```
GET /api/movies # Get all movies
POST /api/movies # Create movie (Admin)
GET /api/movies/:id # Get single movie
PUT /api/movies/:id # Update movie (Admin)
DELETE /api/movies/:id # Delete movie (Admin)
```

**Booking Endpoints**

```
GET /api/bookings/my-bookings # Get user bookings
POST /api/bookings/lock-seats # Lock seats for booking
POST /api/bookings/initiate-khalti # Initiate Khalti payment
POST /api/bookings/verify-khalti # Verify Khalti payment
POST /api/bookings/initiate-esewa # Initiate eSewa payment
POST /api/bookings/verify-esewa # Verify eSewa payment
```

**Admin Endpoints**

```
GET /api/admin/stats # Get dashboard stats
GET /api/admin/sales-report # Get sales report
GET /api/admin/analytics # Get comprehensive analytics
```

## 🔧 Configuration

### Payment Gateway Setup

- **Khalti Setup**: For complete setup instructions, refer to the official [Khalti Documentation](https://docs.khalti.com/).
- **eSewa Setup**: For complete setup instructions, refer to the official [eSewa Documentation](https://developer.esewa.com.np/).

### Email Setup

- Enable 2-factor authentication on your Gmail account.
- Generate an app-specific password.
- Use the app password in the `EMAIL_PASS` environment variable.

### Cloudinary Setup

- Create an account at Cloudinary.
- Get your cloud name, API key, and API secret.
- Add these credentials to the environment variables.

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License
This project is licensed under the MIT [LICENSE](LICENSE) - see the LICENSE file for details.

## 🙏 Acknowledgments

- React - Frontend framework
- Node.js - Backend runtime
- MongoDB - Database
- Tailwind CSS - Styling
- Khalti - Payment gateway
- eSewa - Payment gateway

## 🐛 Issues & Support

If you encounter any issues, please create an issue on the project's GitHub page.

## 📞 Contact

- **Sandip Shrestha** - `sandipshrestha387@gmail.com`

<p align="center">
  Made with ❤️ in Nepal
</p>
<p align="center">
  © 2025 CinePass. All rights reserved.
</p>
