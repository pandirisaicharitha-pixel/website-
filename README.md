# Smart Resume Analyzer (Frontend + Backend)

Professional implementation with all 13 modules and a real backend API.

## Tech Stack

- Frontend: HTML, CSS, Vanilla JS
- Backend: Node.js, Express, JWT, Multer
- Storage: JSON file (`backend/data/db.json`) for local development

## Project Structure

- `index.html`, `styles.css`, `app.js` -> frontend
- `backend/` -> API server

## Run Full Project

### 1) Open terminal and go to backend

```powershell
cd c:\Users\ekans\Downloads\5P0\backend
```

### 2) Install dependencies

```powershell
npm install
```

### 3) Configure env

```powershell
copy .env.example .env
```

### 4) Start backend server

```powershell
npm start
```

Server runs on:

```text
http://localhost:5000
```

The backend also serves frontend static files, so open:

```text
http://localhost:5000/index.html
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/roles`
- `POST /api/resume/analyze` (JWT required)
- `GET /api/profile/history` (JWT required)
- `GET /api/progress` (JWT required)
- `POST /api/progress/learned` (JWT required)
- `POST /api/admin/roles` (JWT + Admin required)

## Notes

- First registered user becomes admin.
- PDF/DOCX/TXT resume parsing is supported by backend.
- If backend is not running, frontend shows an error message.
