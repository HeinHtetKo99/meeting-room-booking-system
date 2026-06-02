# Meeting Room Booking System

A full-stack web application for managing bookings for a single meeting room. Built with **Node.js (Express)** API and **React (Vite)** frontend, with role-based access control for **admin**, **owner**, and **user**.

## Live Demo

| Resource | URL |
|----------|-----|
| **Frontend (live app)** | https://meeting-room-booking-system-psi.vercel.app/ |
| **Backend API** | https://meeting-room-booking-system-production.up.railway.app |
| **GitHub repository** | https://github.com/HeinHtetKo99/meeting-room-booking-system |
| **API health check** | https://meeting-room-booking-system-production.up.railway.app/health |

## How to Use the Live App

1. Open the [frontend URL](https://meeting-room-booking-system-psi.vercel.app/).
2. Use **Login As User** (dropdown) to act as a demo user — no password required (assignment allows simple role simulation via `x-user-id` header).
3. Try the flows below for each role.

### Demo users

| User ID | Name | Role |
|---------|------|------|
| `u1` | Alice Admin | admin |
| `u2` | Oscar Owner | owner |
| `u3` | Uma User | user |

### Quick test checklist

- **User (`u3`)**: create a booking, delete your own booking, try deleting another user's booking (warning dialog).
- **Owner (`u2`)**: view all bookings, delete any booking, open **Bookings Grouped By User**.
- **Admin (`u1`)**: create/delete users, change roles (cannot change own role or delete self), manage all bookings.

## Project structure

- `backend/` — Node.js + Express HTTP API
- `frontend/` — React + Vite UI

## Roles & permissions

| Role | Capabilities |
|------|----------------|
| **admin** | Create/delete users, change roles, view all bookings, delete any booking |
| **owner** | Create/view bookings, delete any booking, view bookings grouped by user |
| **user** | Create/view bookings, delete **own** bookings only |

**Auth model (non-production):** Select a user in the UI. The frontend sends `x-user-id` on each API request. All permission checks are enforced on the **backend**.

## Backend architecture

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

## Booking rules

- `startTime` must be before `endTime`
- Bookings must not overlap (identical, partial, or nested ranges)
- **Back-to-back allowed:** `endTime` of one booking may equal `startTime` of the next
- All times stored as **UTC ISO** strings (see `/health` and `config/timePolicy.js`)
- **Start time must be in the future** (validated on frontend and backend)
- Clear error responses for invalid operations (400 / 403 / 409)

## User deletion policy

When an **admin** deletes a user, **all bookings created by that user are also deleted** (returned in API response).

## API endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/health` | Public |
| GET | `/me` | Authenticated |
| GET | `/users` | admin, owner |
| POST | `/users` | admin |
| PATCH | `/users/:id/role` | admin |
| DELETE | `/users/:id` | admin |
| GET | `/bookings` | all roles |
| POST | `/bookings` | all roles |
| DELETE | `/bookings/:id` | all roles (permission rules apply) |
| GET | `/bookings/summary` | admin, owner |
| GET | `/bookings/grouped-by-user` | admin, owner |

**Header:** `x-user-id: u1` (or `u2`, `u3`, etc.)

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` (defaults to `http://localhost:4000` for API).

Optional `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

## Deployment

| Service | Platform | Root directory | Notes |
|---------|----------|----------------|-------|
| Frontend | [Vercel](https://meeting-room-booking-system-psi.vercel.app/) | `frontend` | Build: `npm run build`, Output: `dist` |
| Backend | [Railway](https://meeting-room-booking-system-production.up.railway.app) | `backend` | Start: `npm start` |

**Vercel environment variable:**

```bash
VITE_API_BASE_URL=https://meeting-room-booking-system-production.up.railway.app
```

(No trailing slash.)

## Author

Hein Htet Ko — [GitHub](https://github.com/HeinHtetKo99/meeting-room-booking-system)
