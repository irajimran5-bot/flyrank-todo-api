# FlyRank Backend Assignment A3 - Dockerized Task API with PostgreSQL

This repository contains a RESTful Task Management API built with **Express.js** and **PostgreSQL**, fully containerized using **Docker** and **Docker Compose**.

---

## 🚀 Features
- **Full CRUD API** for tasks (Create, Read, Update, Delete)
- **PostgreSQL Database** containerized with persistent data volume
- **Single-command local deployment** using Docker Compose
- **Auto-Retry Database Connection** for container synchronization
- **Swagger Open API Documentation** available at `/docs`

---

## 🛠️ Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

---

## 🏃 Quick Start (One Command)

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/flyrank-w2-a1.git](https://github.com/your-username/flyrank-w2-a1.git)
   cd flyrank-w2-a1

```

2. **Run the entire stack:**
```bash
docker compose up --build

```


3. **Access the API:**
* Base URL: `http://localhost:3000`
* Health Check: `http://localhost:3000/health`
* API Docs: `http://localhost:3000/docs`



---

## 📌 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| **GET** | `/` | API Information |
| **GET** | `/health` | DB Connection Status |
| **GET** | `/tasks` | Fetch all tasks |
| **GET** | `/tasks/:id` | Fetch task by ID |
| **POST** | `/tasks` | Create a new task |
| **PUT** | `/tasks/:id` | Update task title or status |
| **DELETE** | `/tasks/:id` | Delete task by ID |

```

