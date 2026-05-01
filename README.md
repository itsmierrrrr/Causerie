# Causerie (MERN Realtime Chat)

A clean, modern 1:1 chat app built with MERN + Socket.IO.

## Features
- User signup/login with JWT auth
- Unique username per user
- Username can be updated (still unique)
- Search users by username/name
- 1:1 conversations
- Realtime message delivery with Socket.IO
- Responsive modern dark UI

## Tech
- Frontend: React + Vite + React Router + Axios + socket.io-client
- Backend: Express + MongoDB + Mongoose + JWT + bcrypt + Socket.IO

## Setup

### 1) Backend
1. Copy `server/.env.example` to `.env` inside the `server` folder.
2. Fill values, especially `MONGO_URI` and `JWT_SECRET`.
3. Run:
   - `cd server`
   - `npm install`
   - `npm run dev`

### 2) Frontend
1. Copy `client/.env.example` to `.env` inside the `client` folder.
2. Run:
   - `cd client`
   - `npm install`
   - `npm run dev`

## API Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PUT /api/users/username`
- `GET /api/users/search?q=...`
- `GET /api/messages/conversations`
- `GET /api/messages/:userId`
- `POST /api/messages/:userId`
