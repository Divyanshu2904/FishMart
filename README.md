# 🐟 FishMart - Fresh Fish Marketplace

FishMart is a complete, modern, and decentralized e-commerce platform that connects local fishermen and verified fish sellers directly with buyers across India. By eliminating middle-agents, FishMart ensures buyers get the freshest catch at the best prices while helping local fisheries earn fair margins.

---

## ✨ Key Features

### 👤 Buyer Journey
- **Browse & Filter Listings**: Real-time product search with multi-select filters for category (Freshwater, Saltwater, Shellfish, Prawns), location (states), and freshness status (Fresh Today, Live Stock, Frozen).
- **Persistent Shopping Cart**: Easy-to-use cart management with automatic calculations.
- **Secure Checkout**: Cash on Delivery (COD) order placement with instant shipping tracking code generation.
- **Order Tracking Timeline**: Real-time shipment status milestone tracker showing progress updates (Placed ➔ Confirmed ➔ Shipped ➔ Delivered).

### 💼 Seller Journey
- **Seller Onboarding & Authentication**: Secure registration and login mechanism.
- **Interactive Seller Dashboard**: Real-time business metrics tracking:
  - Total Orders received
  - Total Revenue earned
  - Active listings count
- **Product Management**: List new fish products with weight, price, category, location, and custom description details.
- **Fulfillment Management**: Dynamic dropdown controls to update order shipment status, automatically updating the buyer's order tracking page.

### 🔒 Backend & Security
- **Hashed Passwords**: Password encryption using `bcryptjs` before storage.
- **JWT Authorization**: Session management using JSON Web Tokens (JWT) for secure authentication.
- **Route Protection Middleware**: Verification check blocks unauthorized requests to critical actions (e.g. creating listings or updating orders).

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries |
|---|---|---|
| **Frontend** | React.js, TypeScript, Vite | Tailwind CSS, Framer Motion, Lucide Icons, Radix UI (Shadcn) |
| **Backend** | Node.js, Express.js | CORS, Dotenv, JSONWebToken, BcryptJS |
| **Database** | SQLite3 | Native Promise-based wrapper |

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
│   │   ├── products.js         # Products CRUD & filtered search
│   │   ├── orders.js           # Checkout & timeline tracking
│   │   └── seller.js           # Seller stats, orders list & status updates
│   ├── .env                    # PORT & JWT Secret settings
│   ├── db.js                   # Schema builder & automatic database seeder
│   ├── fishmart.db             # SQLite database file (auto-generated)
│   └── server.js               # Application entrypoint
│
└── Frontend/                   # React SPA client
    ├── src/
    │   ├── components/         # Reusable UI parts & Layout elements
    │   ├── context/            # Global React state contexts
    │   │   ├── CartContext.tsx # Persistent shopping cart logic
    │   │   └── AuthContext.tsx # User session token management
    │   ├── pages/              # Routing page views (Marketplace, Dashboard, Checkout...)
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
- `GET /api/products` - Get products (supports search, category, location, and freshness queries).
- `GET /api/products/:id` - Get details of a single product.
- `POST /api/products` - List a new product (requires Seller JWT).

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
