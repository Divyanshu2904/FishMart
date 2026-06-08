# 🐟 FishMart - Fresh Fish Marketplace

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen?style=for-the-badge&logo=vercel)](https://fishmart-demo.vercel.app/)

🔗 **Live Demo Link:** [https://fishmart-demo.vercel.app/](https://fishmart-demo.vercel.app/)

FishMart is a complete, modern, and decentralized e-commerce platform that connects local fishermen and verified fish sellers directly with buyers across India. By eliminating middle-agents, FishMart ensures buyers get the freshest catch at the best prices while helping local fisheries earn fair margins.

---

## ✨ Features Implemented

### 👤 Buyer Journey
- **Browse & Filter Listings**: Real-time product search with multi-select filters for category (Freshwater, Saltwater, Shellfish, Prawns), location (states), and freshness status (Fresh Today, Live Stock, Frozen).
- **Price Range Filter**: Dynamic min/max price range query parameters integrated with both client and backend database queries.
- **Location-Based Nearby Search ("Near Me")**:
  - Auto-detect coordinates using the browser's `navigator.geolocation` API.
  - Compute precise distances in kilometers to the seller's harbor/location using the Haversine formula.
  - Sort results by nearest sellers first when toggling "Near Me".
  - Dynamic distance badge displays on product cards showing distance to the seller (e.g. `(8.5 km)`).
- **Delivery Availability Badges**: Intelligent badges calculated from distance (e.g. `🟢 Fast Delivery Available (within 2 hours)`, `🟢 Same Day Delivery`, or `🚚 Next Day Delivery`).
- **Product Reviews**: Submit reviews directly to the database. Retrieve aggregate product and seller reviews, calculating dynamic overall ratings.
- **Persistent Shopping Cart**: Easy-to-use cart management with automatic calculations.
- **WhatsApp Seller Contact**: Direct integration buttons to chat with sellers instantly on WhatsApp with pre-filled message templates.
- **Secure Checkout**: Cash on Delivery (COD) order placement with instant shipping tracking code generation.
- **Order Tracking Timeline**: Real-time shipment status milestone tracker showing progress updates (Placed ➔ Confirmed ➔ Shipped ➔ Delivered).

### 💼 Seller Journey
- **Seller Onboarding & Authentication**: Secure registration and login mechanism.
- **Interactive Seller Dashboard**: Real-time business metrics tracking:
  - Total Orders received
  - Total Revenue earned
  - Active listings count
- **Product Management**: List new fish products with weight, price, category, location, and custom description details.
- **Edit & Delete Listings**: Full CRUD capabilities for sellers to modify or delete their product listings.
- **Real Image Upload**: Fully integrated backend image uploader using local static file storage (via `multer`) with automated fallback to Cloudinary.
- **Fulfillment Management**: Dynamic dropdown controls to update order shipment status, automatically updating the buyer's order tracking page.
- **Glowing Online Indicator**: Shows real-time seller online/offline status dynamically.

### 🔒 Backend & Security
- **Hashed Passwords**: Password encryption using `bcryptjs` before storage.
- **JWT Authorization**: Session management using JSON Web Tokens (JWT) for secure authentication.
- **Route Protection Middleware**: Verification check blocks unauthorized requests to critical actions (e.g. creating listings or updating orders).

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries |
|---|---|---|
| **Frontend** | React.js, TypeScript, Vite | Tailwind CSS, Framer Motion, Lucide Icons, Radix UI (Shadcn), Sonner Toast |
| **Backend** | Node.js, Express.js | Multer (file upload), Cloudinary, CORS, Dotenv, JSONWebToken, BcryptJS |
| **Database** | SQLite | Promise-based SQLite3 database (auto-seeded on server startup) |

---

## 📂 Project Structure

```text
FishMart/
├── Backend/                    # Node.js Express server
│   ├── middleware/             # Auth check middlewares (JWT verification)
│   │   ├── auth.js             # General authentication check
│   │   └── sellerAuth.js       # Seller-only check
│   ├── routes/                 # Express route handlers
│   │   ├── auth.js             # User login, registration, /me profiles
│   │   ├── products.js         # Products CRUD, distance sort & price filters
│   │   ├── reviews.js          # Product & seller review submissions & aggregations
│   │   ├── upload.js           # Multer multipart & Cloudinary image uploading
│   │   ├── orders.js           # Checkout & timeline tracking
│   │   └── seller.js           # Seller stats, orders list & status updates
│   ├── uploads/                # Local uploaded product images directory
│   ├── .env                    # PORT & JWT Secret settings
│   ├── db.js                   # Schema builder & SQLite database seeder
│   ├── fishmart.db             # SQLite database file (auto-generated)
│   └── server.js               # Application entrypoint
│
└── Frontend/                   # React SPA client
    ├── src/
    │   ├── components/         # Reusable UI components (Product cards, reviews section)
    │   ├── context/            # Global React state contexts (Cart, Authentication)
    │   ├── pages/              # Page layouts (Marketplace, SellerDashboard, ProductDetail...)
    │   ├── App.tsx             # Routes definition & context wrapping
    │   └── main.tsx            # React application bootstrap
```

---

## 🚀 Quick Start Guide

Follow these steps to run the application locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

---

### Step 1: Run the Backend Server
1. Open a terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *The server will boot on port 5000 and automatically build/seed the SQLite database file `fishmart.db` in your directory.*

---

### Step 2: Run the Frontend Server
1. Open a second terminal window and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Click on the link generated in the terminal (usually `http://localhost:5173`) to launch the application.

---

## 📡 API Endpoints

### 🔐 Authentication
- `POST /api/auth/signup` - Register a new buyer or seller account.
- `POST /api/auth/login` - Authenticate credentials and get JWT token.
- `GET /api/auth/me` - Retrieve authenticated user info.

### 🐟 Products
- `GET /api/products` - Get products (supports search, category, location, freshness, page/limit pagination, minPrice/maxPrice, and distance coordinates sorting).
- `GET /api/products/:id` - Get details of a single product (incorporates distance coordinates calculation).
- `POST /api/products` - List a new product (requires Seller JWT).
- `PUT /api/products/:id` - Edit product listing (requires Seller JWT).
- `DELETE /api/products/:id` - Delete product listing (requires Seller JWT).

### 💬 Reviews
- `GET /api/reviews/product/:productId` - Get reviews for a specific product.
- `POST /api/reviews/product/:productId` - Submit review for a product (requires User JWT).
- `GET /api/reviews/seller/:sellerId` - Get public review page for a seller.

### 🖼️ Image Upload
- `POST /api/upload` - Upload product images locally to `/uploads` or Cloudinary.

### 🛒 Checkout & Tracking
- `POST /api/orders/checkout` - Place cart order and get shipping details.
- `GET /api/orders/track/:orderNumber` - Get order status details and milestones.

### 💼 Seller Operations
- `GET /api/seller/stats` - Fetch seller-specific metrics (requires Seller JWT).
- `GET /api/seller/orders` - Get orders for seller's products (requires Seller JWT).
- `PUT /api/seller/orders/:orderNumber/status` - Update delivery milestone (requires Seller JWT).
- `GET /api/seller/profile/:sellerId` - Get public seller page information and their items.

---

## 📄 License
This project is open-source and available under the MIT License.
