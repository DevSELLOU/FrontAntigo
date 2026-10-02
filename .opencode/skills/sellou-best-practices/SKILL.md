---
name: sellou-best-practices
description: Applies sellou-front2025 architecture, SOLID, and security best practices to new developments and refactoring
license: MIT
---
## What I do
- Guide developers to follow the **Server-First with Contracts** architecture for the sellou-front2025 project
- Enforce SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion)
- Apply security best practices (httpOnly cookies, no CORS on Next.js, validation on server actions)
- Detect and fix issues from the code analysis at `best-practices.md` and `code-analysis.md`

## When to use me
Use this when:
- Creating a **new feature** (component, page, server action, hook)
- **Refactoring** existing code to align with the target architecture
- Doing a **code review** — run this skill against the diff
- Writing a **Server Action** — to ensure validation, type safety, and proper error handling
- Building a **form** or **modal** — to follow the established patterns
- Setting up **authentication** or **token management** — to avoid security pitfalls

## Key references
- `best-practices.md` — Full best practices guide with architecture, patterns, and examples
- `code-analysis.md` — Identified issues and prioritized refactoring roadmap

## How I work
1. Read the relevant source file(s) for context
2. Identify deviations from the target architecture:
   - Mixed data fetching patterns (Server Component + React Query for the same data)
   - Wrapper Types coupling server and client
   - `any` types, `Omit<X> & Y` patterns
   - Tokens in `localStorage` or cookies without `httpOnly`
   - `redirect()` inside utility functions
   - Missing Zod validation in server actions
   - `console.log` in production code
   - Excessive `staleTime` for volatile data
   - Missing pagination
3. Apply corrections following the patterns in `best-practices.md`
4. Verify the result compiles and follows SOLID principles

## Architecture rules I enforce

### Server Actions
- Input MUST be `unknown`, validated with API schema's `safeParse`
- MUST return `CommonResponse<T> | ApiErrorResponse`, never throw
- MUST use `HttpClient` abstraction, not raw `fetch`
- MUST call `revalidateTag` after mutations

### Components
- Dumb components go in `components/ui/` (shadcn)
- Smart components go in `components/features/`
- Forms use `react-hook-form` + `zod` resolver
- Modals use shadcn `Dialog`

### Data fetching
- Prefer Server Components for initial data load
- Use React Query only for data needing real-time refetch
- Never pass Wrapper Types as props — pass only IDs

### Security
- No `Access-Control-Allow-Origin: *` in Next.js config
- Tokens in `httpOnly`, `secure`, `sameSite` cookies
- No `localStorage` for auth data
- `redirect()` only in Server Components/Actions, not in utilities
