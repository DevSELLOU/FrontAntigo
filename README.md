# Sellou Frontend

Next.js web application for the Sellou sales force management platform.

## Overview

Sellou is a sales force automation platform that helps companies manage their sales teams, track orders, set goals, and analyze performance. This frontend provides an intuitive interface for all platform operations.

## Features

- **Admin Dashboard** — Company-wide management and analytics
- **Sales Portal** — Sales representative workspace
- **Order Management** — Create, track, and manage orders with Kanban board
- **Goals Dashboard** — Set and track sales targets and KPIs
- **Customer Management** — CRM functionality with profile, contacts, payment methods
- **Route & Trip Management** — Plan and execute field sales routes
- **Reports & Analytics** — Visual dashboards, pivots, and exportable reports
- **Customer Shop** — Public-facing storefront per franchise

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 3 + shadcn/ui + Radix primitives
- **State Management**: @tanstack/react-query (server state), React Context (auth, cart)
- **Forms**: react-hook-form + zod + @hookform/resolvers
- **Auth**: next-auth v4 (admin), cookie-based (shop)
- **Charts**: Recharts, Plotly.js, react-pivottable
- **Maps**: Leaflet + react-leaflet
- **Drag & Drop**: @dnd-kit (Kanban board)
- **Icons**: lucide-react

---

## Architecture

### Target: Server-First with Contracts

```
┌──────────────────────────────────────────────────────────┐
│                   app/ (Next.js)                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Páginas   │  │ API Routes │  │ middleware.ts          │ │
│  │ (Server   │  │ (proxy)   │  │ (auth check server-side)│ │
│  │ ou Client)│  │           │  │                        │ │
│  └────┬─────┘  └───────────┘  └────────────────────────┘ │
├───────┴──────────────────────────────────────────────────┤
│             components/ (UI Layer)                        │
│  ┌──────────────────┐  ┌───────────────────────────────┐ │
│  │ features/         │  │ ui/ (shadcn, dumb)            │ │
│  │ (smart, compõem)   │  │ (sem lógica de negócio)       │ │
│  └───────┬──────────┘  └───────────────────────────────┘ │
├──────────┴──────────────────────────────────────────────┤
│             actions/ (Server Actions)                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ handleServerAction() + revalidateTag()               │ │
│  │ Validação OBRIGATÓRIA com Zod antes de enviar à API  │ │
│  └─────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│              contracts/ (Single Source of Truth)          │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────┐ │
│  │ API Schemas │  │Form Schemas│  │ Ports (interfaces)│ │
│  │ (Zod)       │  │ (Zod)      │  │ (HttpClient, etc) │ │
│  │ → infer types│  │ → UX only  │  │                   │ │
│  └────────────┘  └────────────┘  └───────────────────┘ │
├──────────────────────────────────────────────────────────┤
│           infrastructure/ (I/O, External)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ HTTP Client   │  │ Auth Provider│  │ Cache Provider │ │
│  │ (implementa   │  │ (cookies     │  │ (revalidateTag)│ │
│  │  HttpClient)  │  │  httpOnly)   │  │               │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Principles

| Principle | Application |
|---|---|
| **Single Responsibility** | Each layer has one job: `contracts/` defines types, `actions/` orchestrates mutations, `ui/` renders |
| **Open/Closed** | Schemas are extended with `.extend()`, never modified in place |
| **Liskov Substitution** | Every function accepting `CommonResponse<T>` works with any `T` |
| **Interface Segregation** | Pages receive only what they need — no generic Wrapper Types |
| **Dependency Inversion** | Actions depend on `HttpClient` interface, not on `fetch` or `cookies()` directly |

### Key Rules

- **Server Actions** receive `unknown` input, validate with Zod API schema via `safeParse`, return `CommonResponse<T> | ApiErrorResponse`, never throw
- **Data Fetching**: Prefer Server Components for initial load; use React Query only for real-time refetch on client
- **No Wrapper Types**: Pass only IDs as props, let client components fetch what they need
- **Security**: Tokens in httpOnly cookies only, never localStorage; CORS configured on backend only; `redirect()` only in Server Components/Actions
- **Forms**: react-hook-form + zod resolver on client; validation is re-done in the server action with the API schema
- **Modals**: All modals use shadcn `Dialog` for consistent Escape/click-outside/focus behavior

### Project Structure (target)

```
src/
├── app/                      # Next.js App Router pages + layouts
├── actions/                  # Server Actions (mutations only)
│   ├── customer/
│   ├── order/
│   └── ...
├── components/
│   ├── ui/                   # shadcn/ui dumb components
│   ├── features/             # Smart components (compose UI + call actions)
│   └── shared/               # Reusable business components
├── contracts/                # Single source of truth for types
│   ├── api/                  # Zod schemas matching API contracts → z.infer types
│   ├── forms/                # Zod schemas for form validation (UX only)
│   └── ports/                # Interfaces (HttpClient, TokenProvider, etc.)
├── infrastructure/           # I/O implementations
│   ├── http/                 # HttpClient implementation (server + client)
│   └── auth/                 # TokenProvider, cookie management
├── hooks/                    # React hooks (queries, auth, etc.)
├── enums/                    # TypeScript enums
├── utils/                    # Pure utility functions
├── lib/                      # Third-party configuration (query client, etc.)
└── config/                   # App configuration (auth options, etc.)
```

> For complete details, see `best-practices.md` and `code-analysis.md`.

---

## Project Structure (current)

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/          # Admin layout routes
│   │   ├── (sellou)/     # Sellou-level admin
│   │   └── company/      # Company-level admin
│   ├── (auth)/            # Auth pages (sign-in, forgot/reset password)
│   ├── (shop)/            # Shop/customer layout routes
│   └── api/               # API routes (proxy + locations)
├── actions/               # Server Actions
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── admin/            # Sidebar, header, pagination, filters
│   ├── customers/        # Customer CRUD + profile
│   ├── orders/           # Kanban + table + form
│   ├── products/         # Product CRUD + stock
│   ├── routes/           # Routes + trips
│   └── ...
├── contexts/             # React contexts (shop auth, shop cart)
├── hooks/                # React hooks (queries, auth, toast)
│   └── queries/          # React Query hooks
├── interfaces/           # TypeScript interfaces (manual)
├── schemas/              # Zod validation schemas
├── types/                # TypeScript types (DTOs, wrappers)
├── enums/                # TypeScript enums
├── errors/               # Custom error classes
├── utils/                # Utility functions
├── helpers/              # Field mappings
├── constants/            # App constants
├── lib/                  # Utilities (cn, query client)
└── config/               # Configuration (auth options)
```

---

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Create a `.env.local` file in the root directory:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_secure_secret_key
```

## Running the Application

### Development
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### Production
```bash
npm run build
npm start
```

## User Interfaces

### Administrator
Full access to all features including:
- Company management
- User management
- System-wide analytics
- Settings and configuration

### Sales Representative
Access to:
- Personal dashboard
- Order management
- Customer management
- Personal goals tracking
- Route and trip management

### Customer Client
Access to:
- View own orders
- Create new orders
- Order history

## Integration

The frontend connects to the Sellou Backend API at `NEXT_PUBLIC_API_URL`. Make sure the backend is running before starting the frontend.

## License

Proprietary — Epicora Software House
