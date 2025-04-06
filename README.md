# Maki E-Commerce Platform

A full-stack e-commerce application built with React and Node.js, featuring a modern UI, secure authentication, product management, shopping cart functionality, payment processing, and order management.

## Features

### User Features
- **User Authentication** - Secure signup and login functionality with JWT authentication
- **Product Browsing** - Browse products by category with a responsive and intuitive interface
- **Featured Products** - Highlighted products displayed on the homepage
- **Shopping Cart** - Add, update, and remove items from your shopping cart
- **Checkout Process** - Seamless checkout experience with multiple payment options:
  - Credit Card payments via Stripe
  - Cash on Delivery
  - In-store Pickup
- **Order Tracking** - View order history and current order status
- **Receipt Generation** - Download PDF receipts for completed orders

### Admin Features
- **Dashboard** - Analytics and sales overview
- **Product Management** - Add, edit, delete, and feature/unfeature products
- **Order Management** - View and update order statuses
- **Coupon Management** - Create and manage discount coupons

## Technology Stack

### Frontend
- **React** (v19) - Modern UI library for building interactive user interfaces
- **React Router** (v7) - For client-side routing
- **Zustand** - Lightweight state management solution
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Animation library for smooth transitions
- **Axios** - HTTP client for API requests
- **Recharts** - Charting library for analytics visualization
- **React Hot Toast** - For user notifications
- **Stripe.js** - For secure payment processing
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime for server-side code
- **Express** - Web framework for Node.js
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - For password hashing
- **Cloudinary** - Cloud storage for product images
- **Redis** - In-memory data structure store for caching
- **PDFKit** - PDF generation for order receipts
- **Stripe** - Payment processing API

## Project Structure

```
react-ecommerce/
├── backend/
│   ├── controllers/     # Business logic for API endpoints
│   ├── lib/             # Configuration for external services
│   ├── middleware/      # Authentication and request processing
│   ├── models/          # Database schemas
│   ├── receipts/        # Generated receipts (temporary storage)
│   ├── routes/          # API route definitions
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point for the backend
│
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── assets/      # Images and other resources
│       ├── components/  # Reusable UI components
│       ├── lib/         # Utility functions and configurations
│       ├── pages/       # Page components
│       └── stores/      # State management
│
└── .env                 # Environment variables
```

## Key Features Implementation

### Authentication
- JWT-based authentication with secure HTTP-only cookies
- Role-based access control (User/Admin)

### Product Management
- Cloud-based image storage with Cloudinary
- Redis caching for featured products to improve performance

### Shopping Cart
- Persistent cart storage in the database
- Real-time cart updates

### Payment Processing
- Secure credit card processing with Stripe
- Alternative payment methods (Cash on Delivery, In-store Pickup)

### Order Management
- Comprehensive order tracking system
- PDF receipt generation with PDFKit

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Redis

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   REDIS_URL=your_redis_url
   ```

4. Start the development servers:
   ```
   # Start backend server
   npm run dev
   
   # In a separate terminal, start frontend server
   cd frontend && npm run dev
   ```

## License
ISC
