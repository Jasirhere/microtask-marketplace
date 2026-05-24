# WorkHub — Local Micro-Task Marketplace

WorkHub is a full-stack micro-task marketplace where users can post local jobs, apply as workers, communicate in real time, complete tasks, exchange reviews, and process test payments.

Built with React, FastAPI, PostgreSQL, WebSockets, Stripe Test Mode, Alembic, and Docker Compose — demonstrating a complete end-to-end marketplace workflow.

---

## Features

### Dual User Mode
- A single account can operate as both Poster and Worker
- Seamless mode switching with separate profiles for each role

### Job Marketplace
- Posters create jobs with category, location, budget, deadline, duration, and required skills
- Workers browse open listings and apply with a proposed rate and cover letter
- Posters review applicants and select a worker

### Real-Time Chat
- Chat unlocks once a worker is selected
- WebSocket-based messaging persisted in PostgreSQL
- Live unread message badge in the header

### Completion Flow
- Both Poster and Worker must confirm completion
- Job is marked complete only after both sides confirm

### Reviews & Ratings
- Poster can review Worker and vice versa
- Ratings and review counts are displayed on profiles

### Payments
- Stripe Test Mode integration
- Poster releases payment after job completion
- Payment status, Stripe PaymentIntent ID, final price, and timestamp saved in PostgreSQL

### Notifications
- New application alerts
- Accepted / rejected application updates
- Completion confirmations
- Review and payment notifications

### Infrastructure
- PostgreSQL with SQLAlchemy ORM and Alembic migrations
- Dockerized frontend, backend, and database
- One-command local setup with Docker Compose

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Stripe Elements |
| Backend | Python, FastAPI, SQLAlchemy, Alembic, JWT Auth, WebSockets |
| Database | PostgreSQL |
| Payments | Stripe Test Mode |
| DevOps | Docker, Docker Compose |

---

## Architecture

```
React Frontend
    ↓ HTTP / WebSocket
FastAPI Backend
    ↓ SQLAlchemy
PostgreSQL Database
```

Docker Compose runs three services:

```
frontend   →  React / Vite application
backend    →  FastAPI API server
postgres   →  PostgreSQL database
```

---

## Project Structure

```
microtask-marketplace/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas/
│   │   └── services/
│   ├── alembic/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (must be running before you start)

---

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd microtask-marketplace
```

### 2. Configure Environment Variables

Real `.env` files are intentionally not committed. Copy from the provided examples:

**Mac / Linux**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Windows**
```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### 3. Backend Environment

`backend/.env.example`

```env
JWT_SECRET=replace_me_with_a_long_random_secret
JWT_ALG=HS256
JWT_EXPIRES_MINUTES=60

STRIPE_SECRET_KEY=sk_test_replace_me

DATABASE_URL=postgresql+psycopg://postgres:123456789@postgres:5432/microtask_marketplace
```

> **Note:** Keep the database host as `postgres` (not `localhost`) — the backend connects to PostgreSQL through Docker's internal network.

### 4. Frontend Environment

`frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
```

To test payments, create a free [Stripe account](https://stripe.com) and use your test keys.

### 5. Start the Application

```bash
docker compose up --build
```

This starts the database, backend, and frontend together.

### 6. Run Database Migrations

Open a second terminal and run:

```bash
docker compose exec backend alembic upgrade head
```

### 7. Open the App

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## Stripe Test Payment Details

Use Stripe test mode only. **Do not enter real card details.**

```
Card Number:  4242 4242 4242 4242
Expiry:       10/36
CVC:          123
Name:         Test User
Email:        testuser@gmail.com
```

---

## User Flow

```
1.  Register an account
2.  Log in
3.  Create a Poster or Worker profile
4.  Poster creates a job
5.  Worker applies
6.  Poster selects a Worker
7.  Chat unlocks
8.  Both users confirm job completion
9.  Both users submit reviews
10. Poster releases Stripe test payment
```

---

## Database Tables

| Table | Description |
|---|---|
| `users` | Registered accounts |
| `poster_profiles` | Poster profile data |
| `worker_profiles` | Worker profile data |
| `jobs` | Job listings |
| `applications` | Worker applications |
| `notifications` | In-app notifications |
| `job_completions` | Completion confirmations |
| `reviews` | Ratings and reviews |
| `chat_messages` | Persisted chat history |

---

## Docker Commands

| Action | Command |
|---|---|
| Start the project | `docker compose up --build` |
| Stop the project | `docker compose down` |
| Check running containers | `docker compose ps` |
| View backend logs | `docker compose logs backend` |
| View frontend logs | `docker compose logs frontend` |
| Open PostgreSQL shell | `docker compose exec postgres psql -U postgres -d microtask_marketplace` |
| List database tables | `\dt` (inside psql) |

---

## Security Notes

- Real `.env` files are Git-ignored — never commit them
- Do not commit Stripe secret keys or database passwords
- Use `.env.example` files to document required variables
- Stripe is configured in test mode only

---

## Roadmap

- Production deployment
- Chat pagination
- Redis for real-time scaling
- Email notifications
- File and image upload storage
- Admin dashboard
- AI-powered job recommendations
- Advanced location filtering
- Search and ranking improvements
- Mobile UX polish

---

## Author

**Jasir Khan**