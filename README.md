# FlyRank Backend Track - Assignment A2: Database-Backed CRUD API

Updated to use SQLite database persistence with `better-sqlite3`.

## Why SQLite?
SQLite was chosen because it provides single-file storage with zero configuration overhead, perfect for development while ensuring data outlives application restarts.

## Database Details
* **File Location:** `tasks.db` (auto-created on startup, git-ignored)
* **Table Schema:** `tasks` (id INTEGER, title TEXT, done INTEGER)

## SQL Exploration
Executed directly via DB Browser for SQLite:
```sql
SELECT * FROM tasks WHERE done = 1;
Result: Returns all completed tasks directly from the persistent storage file.

How to Run
Clone this repository:

Bash
git clone [https://github.com/irajimran5-bot/flyrank-todo-api.git](https://github.com/irajimran5-bot/flyrank-todo-api.git)
cd flyrank-w2-a1
Install dependencies:

Bash
npm install
Start the server:

Bash
node index.js
Access Swagger UI docs at: http://localhost:3000/docs

