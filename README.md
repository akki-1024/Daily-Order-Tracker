# 🧾 HisaabBook — Daily Order Tracker

Track daily orders, see who owes what, share a QR code, mark payments received. Only **you** can log in and manage things — everyone else just views via the shared link.

---

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas URI

### 1. Install all dependencies

```bash
cd order-tracker
npm run install:all
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

**Set your admin password** — run this once to generate the hash:

```bash
node -e "const b=require('bcryptjs'); b.hash('yourpassword',10).then(console.log)"
```

Paste the output into `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/order-tracker
CLIENT_URL=http://localhost:3000
JWT_SECRET=some_long_random_string_here
ADMIN_PASSWORD_HASH=$2a$10$...paste_hash_here...
```

> **JWT_SECRET** — just type any long random string, e.g. `hisaab_super_secret_2024_xyz`

### 3. Start the app

```bash
# From the root order-tracker/ folder
npm install        # installs concurrently
npm run dev        # backend :5000 + frontend :3000
```

Open **http://localhost:3000** → you'll be prompted for your password.

---

## How it works

**You (admin):**
1. Log in with your password
2. Create an order — add persons, items, prices
3. Click **📱 Share QR** → show or send the link
4. When someone pays, tap **Mark Paid** next to their name

**Others (public link):**
- Open the link / scan QR → see what they owe, no login
- Cannot modify anything

---

## Security model

| Action | Who can do it |
|--------|--------------|
| View shared order link | Anyone |
| View order list / detail | Admin only (JWT) |
| Create / edit / delete orders | Admin only |
| Mark payments paid/unpaid | Admin only |

All write endpoints require a `Authorization: Bearer <token>` header. The JWT is stored in `localStorage` and expires after 30 days.

---

## Project Structure

```
backend/
  middleware/auth.js      ← JWT verification middleware
  routes/auth.js          ← POST /login, POST /verify
  routes/orders.js        ← All order endpoints (protected)
  models/Order.js
  server.js

frontend/src/
  context/AuthContext.js  ← Login state + token storage
  context/OrderContext.js
  components/ProtectedRoute.js
  pages/Login.js
  pages/Dashboard.js
  pages/OrderForm.js
  pages/OrderDetail.js
  pages/PayPage.js        ← Public, no auth
```

## Deployment

- **Backend:** Railway / Render — set all 4 env vars in dashboard
- **Frontend:** Vercel / Netlify — set `REACT_APP_API_URL=https://your-backend.com/api`
- Token still lives in localStorage on the deployed frontend — works fine
