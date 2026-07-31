# FlyRank Backend Assignment A4 - API Authentication & Security with Supabase

This project is a containerized **Node.js & Express API** integrated with **PostgreSQL** and **Supabase Auth**. It implements full user authentication (Sign up, Log in, Log out), token verification middleware, and Swagger UI Bearer token documentation.

---

## 🚀 Features
- **User Authentication:** Sign up, log in, and log out using Supabase Auth.
- **JWT Verification:** Custom auth middleware (`requireAuth`) validating Bearer tokens.
- **Protected Endpoints:** Restricted routes accessible only with valid JWT tokens.
- **Task Management (CRUD):** Standard Task endpoints with PostgreSQL connection.
- **Interactive Documentation:** Swagger UI configured with Bearer Auth security scheme.

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=3000
DATABASE_URL=your_postgres_connection_string
SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
SUPABASE_KEY=your_supabase_anon_public_key

```

> **Note:** Never commit `.env` to Git. Only `.env.example` is committed.

---

## 🏃 Running the Application

### Option 1: Using Docker Compose (Recommended)

```bash
docker compose up --build

```

### Option 2: Local Node.js Setup

```bash
npm install
npm start

```

Once running, access the services at:

* **Base URL:** `http://localhost:3000`
* **Swagger Documentation:** `http://localhost:3000/docs`

---

## 📌 API Endpoints & Auth Reference

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| **GET** | `/` | API Root / Info | ❌ No |
| **GET** | `/health` | Server & Database Health Check | ❌ No |
| **POST** | `/auth/signup` | Register a new user account | ❌ No |
| **POST** | `/auth/login` | Authenticate and receive access token (JWT) | ❌ No |
| **POST** | `/auth/logout` | End user session | 🔑 Bearer Token |
| **GET** | `/public/info` | Open public info route | ❌ No |
| **GET** | `/protected/profile` | Read logged-in user details | 🔑 Bearer Token |
| **GET** | `/protected/dashboard` | Read user dashboard | 🔑 Bearer Token |
| **GET** | `/tasks` | Fetch all tasks | ❌ No |
| **POST** | `/tasks` | Create a new task | ❌ No |
| **GET** | `/tasks/:id` | Fetch task by ID | ❌ No |
| **PUT** | `/tasks/:id` | Update task by ID | ❌ No |
| **DELETE** | `/tasks/:id` | Delete task by ID | ❌ No |

---

## 📸 Swagger UI Bearer Auth

Open `http://localhost:3000/docs`, click on **Authorize 🔓**, paste your `access_token` generated from `/auth/login`, and test the protected routes directly in the browser!
