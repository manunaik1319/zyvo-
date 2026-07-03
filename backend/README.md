# ZYVO Backend API

> Node.js + Express + Prisma + PostgreSQL REST API for the ZYVO Study Hall Booking Platform.

---

## 🏗️ Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema (PostgreSQL)
│   └── seed.js             # Database seed with demo data
│
├── src/
│   ├── config/             # Service configurations
│   │   ├── database.js     # Prisma client singleton
│   │   ├── firebase.js     # Firebase Admin SDK
│   │   ├── cloudinary.js   # Cloudinary configuration
│   │   └── env.js          # Validated environment variables
│   │
│   ├── controllers/        # Request handlers (thin layer)
│   ├── middleware/         # Auth, error, upload, validate
│   ├── routes/             # Express routers
│   ├── services/           # Business logic
│   ├── utils/              # Helpers, JWT, logger, response
│   ├── validations/        # express-validator rule sets
│   │
│   ├── app.js              # Express app configuration
│   └── server.js           # Server entry point
│
├── uploads/                # Temp uploads (gitignored)
├── .env                    # Environment variables
├── .env.example            # Environment template
└── package.json
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database URL and other credentials
```

### 3. Setup Database
```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login with email/password |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET`  | `/api/auth/me` | Get current user profile |
| `POST` | `/api/auth/logout` | Logout |

### Study Halls
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/study-halls` | List all study halls (with filters) |
| `GET`  | `/api/study-halls/:id` | Get study hall details |
| `GET`  | `/api/study-halls/:id/seats` | Get seat availability |
| `GET`  | `/api/study-halls/:id/reviews` | Get reviews |
| `POST` | `/api/study-halls/:id/reviews` | Submit a review |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bookings` | Create a booking |
| `GET`  | `/api/bookings` | Get my bookings |
| `GET`  | `/api/bookings/:id` | Get booking details |
| `POST` | `/api/bookings/:id/cancel` | Cancel a booking |
| `POST` | `/api/bookings/:id/checkin` | QR check-in |
| `POST` | `/api/bookings/:id/checkout` | Checkout |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/users/profile` | Get profile |
| `PATCH`| `/api/users/profile` | Update profile |
| `POST` | `/api/users/avatar` | Upload avatar |
| `PATCH`| `/api/users/password` | Change password |
| `GET`  | `/api/users/wallet` | Get wallet & recent transactions |
| `GET`  | `/api/users/wallet/transactions` | Full transaction history |
| `GET`  | `/api/users/favorites` | Get favorites |
| `POST` | `/api/users/favorites/:id` | Toggle favorite |
| `GET`  | `/api/users/stats` | Get user stats |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/notifications` | Get notifications |
| `PATCH`| `/api/notifications/read` | Mark as read |
| `PATCH`| `/api/notifications/read-all` | Mark all as read |

### Owner (OWNER role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/owner/study-halls` | My study halls |
| `POST` | `/api/owner/study-halls` | Create study hall |
| `PATCH`| `/api/owner/study-halls/:id` | Update study hall |
| `POST` | `/api/owner/study-halls/:id/images` | Upload images |
| `GET`  | `/api/owner/bookings` | My venue bookings |
| `GET`  | `/api/owner/analytics` | Analytics dashboard |

### Admin (ADMIN role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/admin/dashboard` | Platform dashboard stats |
| `GET`  | `/api/admin/users` | All users |
| `PATCH`| `/api/admin/users/:id/toggle-active` | Activate/deactivate user |
| `GET`  | `/api/admin/study-halls` | All study halls |
| `PATCH`| `/api/admin/study-halls/:id/approve` | Approve study hall |
| `PATCH`| `/api/admin/study-halls/:id/reject` | Reject study hall |
| `GET`  | `/api/admin/bookings` | All bookings |
| `GET`  | `/api/admin/coupons` | All coupons |
| `POST` | `/api/admin/coupons` | Create coupon |
| `PATCH`| `/api/admin/coupons/:id/toggle` | Toggle coupon |

---

## 🔑 Test Credentials (after seeding)

| Role  | Email              | Password   |
|-------|--------------------|------------|
| Admin | admin@zyvo.app     | Admin@123  |
| Owner | owner@zyvo.app     | Owner@123  |
| User  | user@zyvo.app      | User@123   |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Express.js** | REST API framework |
| **Prisma** | ORM & database migrations |
| **PostgreSQL** | Primary database |
| **Firebase Admin** | Push notifications & phone auth |
| **Cloudinary** | Image upload & optimization |
| **Nodemailer** | Transactional emails |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT auth tokens |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |
| **express-validator** | Request validation |
| **Winston** | Structured logging |
| **Morgan** | HTTP request logging |
