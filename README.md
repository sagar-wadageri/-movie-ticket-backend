# 🎬 Movie Ticket Booking System - Backend

A complete backend API for a movie ticket booking system built with Node.js, Express, and MySQL.

## 🚀 Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Admin/User Role Management
- ✅ Movie CRUD Operations
- ✅ Show Management with Auto Seat Generation
- ✅ Seat Booking with Concurrency Control
- ✅ Payment Integration (Mock)
- ✅ Booking History & Cancellation
- ✅ Clean MVC Architecture
- ✅ Error Handling & Status Codes

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Redis** - Caching & Locks (will come soon )

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | Get all movies |
| GET | `/api/movies/:id` | Get movie by ID |
| POST | `/api/movies` | Create movie (Admin) |
| PUT | `/api/movies/:id` | Update movie (Admin) |
| DELETE | `/api/movies/:id` | Delete movie (Admin) |

### Shows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shows/movie/:movieId` | Get shows for a movie |
| GET | `/api/shows/:id` | Get show by ID |
| POST | `/api/shows` | Create show (Admin) |

### Seats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seats/show/:showId` | Get seats for a show |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/book` | Book seats |
| POST | `/api/bookings/confirm` | Confirm booking |
| GET | `/api/bookings/my-bookings` | Get user bookings |
| DELETE | `/api/bookings/:bookingId` | Cancel booking |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment` | Process payment |

## 🚀 Installation

```bash
# Clone repository
git clone https://github.com/sagar-wadageri/-movie-ticket-backend.git

# Navigate to backend
cd -movie-ticket-backend/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials

# Start server
npm run dev