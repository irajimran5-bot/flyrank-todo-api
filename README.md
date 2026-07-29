# FlyRank Backend Track - Assignment A2: Database-Backed CRUD API

Updated to use SQLite database persistence with `better-sqlite3`.

## Why SQLite?
SQLite was chosen because it provides single-file storage with zero configuration overhead, perfect for development while ensuring data outlives application restarts.

## Database Details
* **File Location:** `tasks.db` (auto-created on startup, git-ignored)
* **Table Schema:** `tasks` (id INTEGER, title TEXT, done INTEGER)

## How to Run
```bash
npm install
node index.js

1. Clone this repository:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd flyrank-w2-a1

```

2. Install dependencies:
```bash
npm install

```


3. Start the server:
```bash
node index.js

```


4. Access Swagger UI docs at: `http://localhost:3000/docs`


```
