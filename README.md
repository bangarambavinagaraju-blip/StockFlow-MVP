# StockFlow – Multi-Tenant SaaS Inventory Management System

A full-stack inventory management application built using React, Node.js, Express.js and PostgreSQL. StockFlow enables organizations to manage products, monitor inventory levels, track stock value and receive low-stock alerts through an authenticated dashboard.

## Project Overview

StockFlow is designed to simplify inventory management for organizations through a centralized web application.

The application follows an organization-based data isolation approach, ensuring that authenticated users can access products belonging to their own organization.

## Key Features

### Authentication and Security
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API routes.
- Token expiration and validation.
- Organization-based product isolation.

### Dashboard
- Total product count.
- Total stock quantity.
- Inventory value calculation.
- Low-stock item count.
- Low-stock alerts.

### Product Management
- Add new products.
- View product listings.
- Edit existing products.
- Delete products.
- Search products by name or SKU.
- Product validation.
- Duplicate SKU prevention within an organization.

### Organization Management
- Organization creation during registration.
- Organization-specific product records.
- Organization information in account settings.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | CSS |
| Routing | React Router DOM |
| API Integration | Axios |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JSON Web Tokens |
| Password Security | bcryptjs |
| Database Driver | node-postgres (pg) |
| Development | VS Code, Git, GitHub |

## System Architecture

```text
             USER
               |
               v
       REACT FRONTEND
          (Vite)
               |
               v
        AXIOS API CLIENT
               |
          JWT TOKEN
               |
               v
       EXPRESS BACKEND
               |
       AUTH MIDDLEWARE
               |
               v
       API ROUTES
         /       \
        /         \
   AUTH ROUTES  PRODUCT ROUTES
        \         /
         \       /
               |
               v
        POSTGRESQL
               |
      ORGANIZATION DATA
```

## Project Structure

```text
StockFlow-MVP/
|
|-- backend/
|   |
|   |-- config/
|   |   |-- db.js
|   |
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- productRoutes.js
|   |
|   |-- .env.example
|   |-- package.json
|   |-- server.js
|
|-- frontend/
|   |
|   |-- public/
|   |
|   |-- src/
|   |   |-- pages/
|   |   |   |-- Login.jsx
|   |   |   |-- Signup.jsx
|   |   |   |-- Auth.css
|   |   |
|   |   |-- api.js
|   |   |-- App.jsx
|   |   |-- App.css
|   |   |-- index.css
|   |   |-- main.jsx
|   |
|   |-- .env.example
|   |-- package.json
|   |-- vite.config.js
|
|-- .gitignore
|-- README.md
```

## Database Design

StockFlow uses PostgreSQL for persistent data storage.

### Main Tables

**1. Organizations**
- id
- name
- created_at

**2. Users**
- id
- organization_id
- email
- password_hash
- created_at

**3. Products**
- id
- organization_id
- name
- sku
- description
- quantity
- cost_price
- selling_price
- low_stock_threshold
- created_at
- updated_at

**4. Settings**
- id
- organization_id
- default_low_stock_threshold

### Data Isolation

Each product is associated with an organization through `organization_id`.

The backend obtains the authenticated organization ID from the verified JWT rather than trusting an organization ID supplied by the frontend.

## API Documentation

Base URL:

```text
http://localhost:5000/api
```

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/signup | Register an organization and user |
| POST | /auth/login | Authenticate user |

### Product APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /products | Retrieve organization products |
| GET | /products/:id | Retrieve a product |
| POST | /products | Create a product |
| PUT | /products/:id | Update a product |
| DELETE | /products/:id | Delete a product |

Product endpoints require a valid JWT bearer token.

### Database Test

```text
GET /api/db-test
```

Checks the backend's PostgreSQL connection.

## Installation and Setup

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Git
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/bangarambavinagaraju-blip/StockFlow-MVP.git
```

```bash
cd StockFlow-MVP
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure your PostgreSQL database credentials and JWT secret.

Start the backend:

```bash
npm run dev
```

The backend runs locally on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file using `.env.example` as a reference.

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev -- --port 5175
```

Open:

```text
http://localhost:5175
```

## Environment Variables

### Backend

See `backend/.env.example`.

Required variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_NAME=stockflow_db
JWT_SECRET=your_secure_secret
```

For hosted PostgreSQL, the backend also supports `DATABASE_URL`.

### Frontend

See `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit actual `.env` files or database credentials to GitHub.

## Running the Application

Start PostgreSQL first.

Then start the backend and frontend in separate terminals.

The application can then be accessed through the local frontend URL.

## Deployment

Production deployment is planned using:

| Component | Planned Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Render PostgreSQL |

Live deployment links will be added after deployment and testing.

## Future Enhancements

- Inventory reports and analytics.
- Product category management.
- CSV and Excel export.
- Advanced inventory search and filtering.
- Pagination.
- Role-based organization permissions.
- Persistent inventory preferences.
- Production monitoring.

## Author

**Nagaraju Bangarambavi**

B.Tech – Computer Science and Engineering  
Specialization: Artificial Intelligence and Machine Learning

GitHub: https://github.com/bangarambavinagaraju-blip

---

*StockFlow MVP – Inventory management made simpler.*

