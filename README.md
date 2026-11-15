# FinDesk Web — Cloud Financial Intelligence & Wealth Management Portal

FinDesk Web is a full-stack, enterprise-grade cloud financial intelligence and wealth management web application. It features automated cash flow analytics, AI-powered financial advisory via Google Gemini, two-way CSV ledger import/export, category budget threshold monitoring, long-term savings goal tracking, and resilient dual-mode database persistence (MongoDB Atlas & local storage).

---

## 🌟 Architecture Overview

```
├── client (React 19 + TypeScript + Vite + TailwindCSS 4 + Zustand)
│   ├── src/components (UI primitives, Layout, Interactive SVG Charts)
│   ├── src/features (Dashboard, Income, Expenses, Budgets, Goals, Transactions, Analytics, Admin, Settings)
│   ├── src/api (Axios/Fetch HTTP client with interceptors & token auto-refresh)
│   └── src/store (Reactive auth & session store)
│
├── server (Node.js + Express + TypeScript + Mongoose + JWT)
│   ├── server/src/models (Mongoose schemas for User, Income, Expense, Budget, SavingsGoal, Notification, RefreshToken)
│   ├── server/src/controllers (REST Controllers for all 10 modules)
│   ├── server/src/services (Business logic & calculations)
│   ├── server/src/repositories (dbStore with MongoDB Atlas sync & standalone fallback)
│   ├── server/src/middlewares (Auth JWT, Role RBAC, Rate limiter, Error handler)
│   └── server/src/validators (Payload schema validation)
│
└── devops (Multi-stage Dockerfile, docker-compose.yml, tests)
```

---

## 🚀 Key Features

### 1. Authentication & Security
- **JWT Authentication**: Short-lived access token with refresh token rotation.
- **Bcrypt Hashing**: Multi-round salt hashing for credentials.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `user` and `admin` roles.
- **Rate Limiting**: Defends authentication endpoints against brute force attempts.
- **Demo Mode**: 1-click test credentials for instant evaluation.

### 2. User & Profile Module
- Profile management with customizable avatar and base currency formatting (USD, EUR, GBP, JPY, INR, CAD, AUD).
- Password change flow with active session verification.
- Permanent account self-deletion with cascading record purge.

### 3. Income & Revenue Streams
- Log income with custom sources (*Salary, Freelance, Investment, Business, Rental, Dividends, Bonus, Gift, Other*).
- Real-time search, date range filtering, and inline editing.

### 4. Expense Tracker & Categorization
- 10 standard categories (*Food, Rent, Travel, Shopping, Medical, Education, Entertainment, Bills, Utilities, Others*).
- Automatic budget usage threshold alerts when expenses approach or exceed monthly targets.

### 5. Category Budget Management
- Establish monthly limits per expense category.
- Live percentage utilization bar with clear visual indicators (<80% green, 80-99% amber, ≥100% red).

### 6. Savings Goals & Milestone Tracker
- Create targets with deadline date countdowns.
- Interactive deposit contribution modal with celebration banners upon achieving 100%.

### 7. Real-Time Analytics & Reports
- **Cash Flow Trajectory**: Monthly Income vs Expense comparison.
- **Spending by Category**: Donut distribution with percentage and monetary breakdown.
- **Yearly Ledger Audit**: Period-by-period tabular statement.

### 8. Proactive Notification Engine
- In-app notification center for budget warnings, milestone achievements, and monthly summaries.
- Mark as read / mark all as read functionality with unread counters.

### 9. Unified Transaction History
- Chronological audit ledger merging all inflows and outflows.
- Pagination, keyword search, type filter, and instant **CSV Report Export**.

### 10. Administrator Console
- Platform-wide statistics (Registered accounts, total transactions, platform volume).
- Multi-tenant user directory with account deletion capability.

---

## 📦 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- (Optional) Docker & Docker Compose
- (Optional) MongoDB Atlas URI

### Zero-Configuration Installation (No Environment Variables Required!)

This project features **100% Zero-Configuration design**. You do **NOT** need to create or configure any `.env` file or set any environment variables. All cryptographic keys, ports, and persistence engines come with safe, pre-configured defaults.

1. **Clone or extract repository**:
   ```bash
   cd personal-finance-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server** (Runs immediately with 0 env vars):
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. All features, demo accounts, sample transactions, charts, and budgets work out-of-the-box!

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Standard User** | `alex@finance.dev` | `Password123!` | Complete Personal Finance Management |
| **Administrator** | `admin@finance.dev` | `Password123!` | Personal Finance + Admin Console |

---

## 🐳 Docker & Containerization

### Run full stack with Docker Compose (includes MongoDB):
```bash
docker-compose up --build
```
The application will be accessible on `http://localhost:3000`.

### Stop containers:
```bash
docker-compose down
```

---

## 📋 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT | No |
| `POST` | `/api/auth/refresh-token` | Exchange refresh token for new access token | No |
| `POST` | `/api/auth/logout` | Revoke session refresh token | No |
| `POST` | `/api/auth/forgot-password` | Dispatch password reset link | No |
| `POST` | `/api/auth/reset-password` | Reset password using token | No |
| `GET` | `/api/users/profile` | Retrieve active user profile | Yes |
| `PUT` | `/api/users/profile` | Update profile information | Yes |
| `PUT` | `/api/users/change-password` | Change account password | Yes |
| `GET` | `/api/analytics/dashboard` | KPI totals and chart trend series | Yes |
| `GET` | `/api/analytics/monthly` | Month-wise cash flow metrics | Yes |
| `GET` | `/api/analytics/category` | Cumulative category distribution | Yes |
| `GET` | `/api/income` | List user income entries | Yes |
| `POST` | `/api/income` | Create new income entry | Yes |
| `PUT` | `/api/income/:id` | Update income entry | Yes |
| `DELETE` | `/api/income/:id` | Remove income entry | Yes |
| `GET` | `/api/expenses` | List user expenses | Yes |
| `POST` | `/api/expenses` | Create new expense | Yes |
| `PUT` | `/api/expenses/:id` | Update expense entry | Yes |
| `DELETE` | `/api/expenses/:id` | Remove expense entry | Yes |
| `GET` | `/api/budgets` | List category budgets with usage | Yes |
| `POST` | `/api/budgets` | Set category monthly limit | Yes |
| `PUT` | `/api/budgets/:id` | Update monthly limit | Yes |
| `DELETE` | `/api/budgets/:id` | Delete budget limit | Yes |
| `GET` | `/api/goals` | List savings goals | Yes |
| `POST` | `/api/goals` | Create new savings goal | Yes |
| `POST` | `/api/goals/:id/contribute` | Deposit savings to goal | Yes |
| `GET` | `/api/transactions` | Unified paginated transaction history | Yes |
| `GET` | `/api/transactions/export/csv` | Download transactions as CSV file | Yes |
| `GET` | `/api/admin/stats` | Platform statistics | Admin |
| `GET` | `/api/admin/users` | List registered accounts | Admin |
| `DELETE` | `/api/admin/users/:id` | Purge user account | Admin |

---

## 🧪 Testing

Run backend business logic and authentication test suites:
```bash
npm run test
```

---

## 🌐 Production Deployment

### 1. Database (MongoDB Atlas)
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/personal_finance`.
3. Add IP access permissions (`0.0.0.0/0` or cloud provider IPs).

### 2. Backend (Render / Railway / AWS ECS)
1. Deploy using `server/Dockerfile` or as a Node service running `npx tsx server.ts`.
2. Configure environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-atlas-uri>`
   - `JWT_SECRET=<strong-random-key>`
   - `JWT_REFRESH_SECRET=<strong-random-key>`
   - `PORT=3000`

### 3. Frontend (Vercel)
1. Deploy root project on [Vercel](https://vercel.com).
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.

---

## 📄 License
MIT © Personal Finance Management Dashboard
