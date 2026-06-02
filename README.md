# Meeting Room Booking System

This project includes:

- `backend`: Node.js + Express API with role-based permissions
- `frontend`: React + Vite UI connected to backend API

## Roles

- `admin`: full user management + all booking actions
- `owner`: create/view bookings, delete any booking, view summary/grouping
- `user`: create/view bookings, delete only own bookings

## Backend Architecture

```
backend/src/
  server.js              # App entry point
  app.js                 # Express setup + route mounting
  constants/roles.js     # Role definitions
  config/timePolicy.js   # Documented time/overlap assumptions
  middleware/auth.js     # x-user-id auth + role authorization
  routes/                # HTTP route definitions
  controllers/           # Request/response handling
  services/              # Business rules and permissions
  store/memoryStore.js   # In-memory persistence (assignment scope)
  utils/                 # Date parsing + overlap validation
```

Design choices interviewers can review quickly:

- Permission checks live in middleware + service layer (not only frontend).
- Booking overlap logic is isolated in `utils/bookingRules.js`.
- Controllers stay thin; services own business rules.

## Backend Rules Implemented

- `startTime` must be before `endTime`
- booking overlap is blocked
- back-to-back bookings are allowed (`endTime === next startTime`)
- all booking times are stored in UTC ISO format
- when an admin deletes a user, that user's bookings are deleted too

## Run Locally

Open 2 terminals.

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

By default, frontend uses `http://localhost:4000` for API.  
To change it, create `frontend/.env`:

```bash
VITE_API_BASE_URL=https://your-backend-url
```

## Key API Endpoints

- `GET /users` (admin, owner)
- `POST /users` (admin)
- `PATCH /users/:id/role` (admin)
- `DELETE /users/:id` (admin)
- `GET /bookings` (all roles)
- `POST /bookings` (all roles)
- `DELETE /bookings/:id` (all roles with permission checks)
- `GET /bookings/summary` (admin, owner)
- `GET /bookings/grouped-by-user` (admin, owner)

Use request header:

- `x-user-id: u1` (admin)
- `x-user-id: u2` (owner)
- `x-user-id: u3` (user)

## Deploy Notes

- Deploy backend on Render/Railway (set start command: `npm start` in `backend`)
- Deploy frontend on Vercel (set env: `VITE_API_BASE_URL=<deployed-backend-url>`)

