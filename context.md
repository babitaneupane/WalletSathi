# CONTEXT.md

> **Project:** AI-Powered Personal & Shared Expense Management System
> **Type:** Final Year Computer Engineering Project
> **Scope:** Full-Stack SaaS Web Application

---

## 1. Project Overview

A production-ready, AI-powered financial management platform that helps individuals and groups track income, manage expenses, set budgets, split shared costs, and receive intelligent financial insights — all in one place.

The system is designed to serve as both a practical personal finance tool and a demonstration of full-stack engineering, database design, AI integration, and modern software development practices suitable for a final-year portfolio.

---

## 2. Objectives

| # | Objective |
|---|-----------|
| 1 | Enable users to track personal income and expenses |
| 2 | Allow groups (families, roommates, friends) to manage and split shared expenses |
| 3 | Provide AI-generated financial insights and spending summaries |
| 4 | Deliver savings recommendations based on spending behavior |
| 5 | Offer an AI financial chatbot for both personal and general finance queries |
| 6 | Visualize financial data through an interactive dashboard |

---

## 3. Target Users

### Individual Users
Users who want to monitor personal finances, set spending limits, and receive AI-driven savings advice.

### Shared Groups
Families, roommates, friends, and students who share recurring expenses like rent, groceries, or utilities. Group members can create or join groups, record shared costs, and track who owes what.

---

## 4. Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| ShadCN UI | Component library |
| React Hook Form + Zod | Form management and validation |
| Axios | HTTP client |
| Recharts | Data visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express.js | REST API server |
| TypeScript | Type safety |
| Prisma ORM | Database access layer |
| PostgreSQL (Neon) | Primary database |
| JWT + bcrypt | Authentication and password security |
| Gemini API | AI features |

### Deployment
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Railway / Render | Backend hosting |
| Neon | Managed PostgreSQL |

---

## 5. User Roles

Currently a single role is implemented. Future expansion planned.

**User** — can manage their own profile, transactions, budgets, and group memberships, and access all AI features.

> Planned future roles: `Admin`, `Premium User`

---

## 6. Core Features

### 6.1 Authentication
- Register, login, logout
- JWT-based session management
- bcrypt password hashing
- Protected route middleware

### 6.2 Profile Management
- Update name and profile details
- Change password
- View account information

### 6.3 Income Management
Track all income sources with the following default categories:
`Salary` · `Freelancing` · `Business` · `Allowance` · `Other`

Operations: Add · Edit · Delete · View history

### 6.4 Expense Management
Track all expenses with the following default categories:
`Food` · `Rent` · `Travel` · `Shopping` · `Health` · `Education` · `Entertainment` · `Utilities` · `Other`

Operations: Add · Edit · Delete · View history

### 6.5 Budget Management
Category-based budgets with real-time usage tracking.

Operations: Create · Update · Delete · Track remaining balance

Example: A **Food Budget** of NPR 8,000/month that shows NPR 5,200 used and NPR 2,800 remaining.

### 6.6 Shared Expense Groups
Users can create or join groups via invite code.

**Example:**
```
Group:        Kathmandu Roommates
Invite Code:  ROOM123
Members:      4
Monthly Rent: NPR 24,000
Each Owes:    NPR 6,000
```

Operations: Create group · Join via code · Add shared expense · View member balances

---

## 7. Dashboard

The dashboard provides a real-time financial overview.

### Summary Cards
- Total Income
- Total Expenses
- Total Savings
- Remaining Balance

### Charts
| Chart | Description |
|-------|-------------|
| Expense Pie Chart | Spending distribution by category |
| Monthly Expense Trend | Spending patterns over time |
| Income vs Expense | Monthly comparison |
| Category Analysis | Top spending categories |
| Budget Progress | Usage percentage per budget |

---

## 8. AI Features

All AI features are powered by the **Gemini API**.

### 8.1 Smart Expense Categorization
When a user enters a transaction description, the AI suggests the appropriate category.

```
Input:   "Pizza Hut Dinner"
Output:  Food  (user can override before saving)
```

### 8.2 Monthly Spending Summary
The AI analyzes transaction history and produces a natural-language summary.

```
"You spent 42% of your budget on food this month."
"Transportation costs rose 15% compared to last month."
```

### 8.3 Savings Recommendations
Behavioral analysis to identify actionable savings opportunities.

```
"Reducing restaurant visits by 10% could save approximately NPR 1,500/month."
```

### 8.4 Financial Chatbot
A conversational assistant that answers both personal and general finance questions.

**Personal queries (uses user data):**
- "How much did I spend on food this month?"
- "What was my biggest expense last quarter?"
- "How much did I save in March?"

**General finance queries:**
- "What is an emergency fund?"
- "How do I create a budget?"
- "What is the 50/30/20 rule?"

The chatbot uses the user's financial data, previous chat history, and the Gemini API for context-aware responses.

---

## 9. Database Design

### Models Overview

```
User
  ├── Transaction (INCOME / EXPENSE)
  ├── Budget (category-based, monthly)
  ├── AIInsight
  ├── ChatHistory
  └── GroupMember
        └── Group
              ├── GroupExpense
              │     └── ExpenseSplit
              └── GroupMember
```

### Schema Summary

| Model | Key Fields |
|-------|-----------|
| `User` | id, name, email, password, createdAt |
| `Category` | id, name |
| `Transaction` | id, amount, description, type (INCOME/EXPENSE), categoryId, userId, groupId, createdAt |
| `Budget` | id, amount, month, year, userId, categoryId |
| `Group` | id, name, inviteCode, createdAt |
| `GroupMember` | id, userId, groupId, joinedAt |
| `GroupExpense` | id, title, amount, paidById, groupId, createdAt |
| `ExpenseSplit` | id, groupExpenseId, userId, amount |
| `AIInsight` | id, userId, summary, createdAt |
| `ChatHistory` | id, userId, role, message, createdAt |

---

## 10. API Reference

### Authentication
```
POST   /auth/register
POST   /auth/login
GET    /auth/profile
```

### Transactions
```
POST   /transactions
GET    /transactions
PUT    /transactions/:id
DELETE /transactions/:id
```

### Budgets
```
POST   /budgets
GET    /budgets
PUT    /budgets/:id
DELETE /budgets/:id
```

### Groups
```
POST   /groups
POST   /groups/join
GET    /groups
GET    /groups/:id
```

### Group Expenses
```
POST   /group-expenses
GET    /group-expenses/:groupId
```

### AI
```
POST   /ai/categorize
POST   /ai/summary
POST   /ai/suggestions
POST   /ai/chat
```

### Dashboard
```
GET    /dashboard/overview
GET    /dashboard/charts
```

---

## 11. Folder Structure

```
expense-manager/
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API service functions
│   ├── store/                # Global state management
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper utilities
│
└── backend/
    ├── prisma/
    │   └── schema.prisma     # Database schema
    └── src/
        ├── controllers/      # Route handler logic
        ├── routes/           # Express route definitions
        ├── middleware/        # Auth, error handling
        ├── services/         # Business logic layer
        ├── ai/               # Gemini API integration
        ├── utils/            # Shared utilities
        ├── config/           # Environment configuration
        └── server.ts         # Entry point
```

---

## 12. Non-Functional Requirements

- **Responsive & mobile-friendly UI**
- **Secure authentication** — JWT with short expiry, bcrypt hashing
- **Type safety** — TypeScript across the full stack
- **Validation** — Zod schemas on both client and server
- **Clean architecture** — separation of concerns (controllers → services → DB)
- **Reusable components** — consistent design system via ShadCN
- **Environment management** — `.env` for all secrets, never committed
- **Error handling** — standardized API error responses
- **Database migrations** — managed via Prisma Migrate

---

## 13. Development Roadmap

| Phase | Focus |
|-------|-------|
| 1 | Project Setup & Configuration |
| 2 | Authentication (register, login, JWT) |
| 3 | Transaction Management |
| 4 | Dashboard & Charts |
| 5 | Budget Management |
| 6 | Group Expense Sharing |
| 7 | AI Expense Categorization |
| 8 | AI Insights & Summaries |
| 9 | Financial Chatbot |
| 10 | Testing & Deployment |

---

## 14. Project Goals

This platform demonstrates proficiency across:

- Full-stack development (Next.js + Express + PostgreSQL)
- Relational database design and ORM usage
- RESTful API architecture
- AI/LLM integration (Gemini API)
- Authentication and security best practices
- Data visualization and dashboard design
- Modern DevOps practices (Vercel, Railway, Neon)

Suitable as both a production-ready SaaS product and a comprehensive final-year Computer Engineering project.