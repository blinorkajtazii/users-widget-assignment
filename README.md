
## Users Widget Assignment

A small backend + frontend project that exposes a **Users Statistics Widget**:

- **Backend**: FastAPI endpoint reading `mock_data.csv` and deriving:
  - `users`: total rows
  - `active_today`: fixed percentage of users
  - `conversion_rate`: constant value
- **Frontend**: React + TypeScript widget that fetches the stats, handles loading/error, and renders a reusable UI card.

### Why Vite

The frontend uses **Vite** instead of Create React App or Webpack directly because it offers fast dev startup and HMR out of the box, keeps config minimal, and produces small production builds. For a small widget, this keeps the toolchain simple while still supporting TypeScript, React, and env variables (`VITE_*`).

---

## Prerequisites

- **Backend**: Python 3.9+
- **Frontend**: Node.js 18+ and npm 9+

---

## How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# http://localhost:8000/stats
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173/
```

---

## Architecture

UI Component
   ↓
Custom Hook
   ↓
API Client
   ↓
Backend API

### Why API Client Layer

Instead of calling `fetch` directly inside the hook, a small API layer (`statsApi.ts`) centralizes network logic.  
This improves maintainability and makes it easier to extend later if authentication, headers, or additional endpoints are required.

## Part 3 — Engineering decision

### 1. Custom hook: `useStats`

The widget uses a dedicated hook instead of calling `fetch` directly from the component.

- **What it does**
  - Owns all data-fetching concerns: loading state, errors, refresh, last-updated.
  - Hides implementation details (AbortController, minimum spinner duration, API client).
  - Exposes a small, typed interface that any widget can consume.

- **Why this matters at scale**
  - Keeps **components presentational**: they focus on layout and accessibility, not networking.
  - When more widgets need the same data, they can share or extend `useStats` instead of re-implementing fetch logic.
  - If the data source changes (new endpoint, auth, headers), it is changed **once** in the hook/API layer, not in multiple components.

### 2. Runtime validation of API responses

The API client does not assume backend responses are always correct.

- **What it does**
  - Parses `res.json()` as `unknown`.
  - Uses simple guards and a dedicated `StatsError` type to ensure:
    - The response is an object.
    - `users`, `active_today`, and `conversion_rate` are numbers.
  - Treats invalid responses as a **validation error** that surfaces an error state in the UI instead of crashing.

- **Why this matters at scale**
  - In real systems, backends evolve and sometimes misbehave.
  - This validation acts as a **safety net**: a broken release in one service does not take down the entire dashboard.
  - Failures are **contained to the widget**, and the rest of the UI keeps working.

### 3. Separation of API client from UI

Networking is kept out of React components.

- **What it does**
  - `statsApi.ts` is the single place that:
    - Knows the base URL and endpoint path.
    - Encodes error handling and response validation logic.
  - React components only call `useStats`, which in turn uses `statsApi`.

- **Why this matters at scale**
  - Makes it easy to:
    - Swap environments (staging, prod, different host) by changing an env variable.
    - Add cross-cutting behavior (auth headers, retries, logging) without touching UI code.
  - Encourages **reuse across applications**:
    - The widget can be embedded into different apps that share the same endpoint contract.
    - Only configuration (e.g. `VITE_API_BASE_URL`) needs to change.

---

## Reuse and scalability

- The `UsersWidget` is **self-contained** and driven entirely by `useStats`’s data.
- It does not depend on any global state (Redux, Zustand) or routing.
- It can be:
  - Dropped into other pages within this app.
  - Reused across **multiple applications** that point to the same `/stats` API.
- The pattern (Widget → Hook → API client) can be reused for additional metrics, making it straightforward to grow this into a broader dashboard.

---

## Tradeoffs & decisions

- **No global state manager**
  - Redux/Zustand/MobX are not used because there is a single widget and a single endpoint.
  - Adding global state would add complexity without a clear benefit at this scale.
  - The current structure still leaves room to introduce shared state later, if more widgets and pages appear.

- **Minimal styling**
  - Styling is done via a focused CSS file with widget-specific utility classes.
  - This keeps the bundle size small and avoids coupling to a heavy design system dependency.
  - The CSS is organized so it can be promoted to **tokens/SCSS modules** later if more widgets and views are added.

---

## Not implemented (next steps)

With more time, I would add:

- **Testing**
  - Unit tests for the FastAPI endpoint, including error paths (missing CSV, malformed row).
  - Unit tests for `statsApi` (happy path, HTTP errors, invalid JSON, validation errors).
  - Tests for `useStats` (loading lifecycle, abort handling, retry behavior).

- **Caching and retries**
  - Use a data-fetching library like React Query or SWR to:
    - Cache `/stats` responses.
    - Handle retries with backoff for transient failures.
    - Share the same data across multiple widgets.

- **Richer error handling**
  - Use the `StatsError` kind (`network` | `http` | `validation`) to show more specific messages in the UI.
  - Add optional error reporting hooks (e.g. logging to an error tracking service).

- **Design system integration**
  - Extract the current card styles and layout into shared SCSS modules or tokens.
  - Align typography, spacing, and colors with a broader design system so the widget matches other parts of the product.
  - Improve accessibility further (focus states, ARIA labels) as additional widgets are added.

---

## What this project demonstrates

- **Structure**
  - Clear separation between UI, hook, API client, and backend.
  - Components remain presentational; data logic lives in hooks and API modules.

- **Typing**
  - Strong TypeScript types (`Stats`, `UseStatsResult`, `StatsError`) for data and errors.
  - Pydantic models on the backend to keep the API contract consistent.

- **Edge case handling**
  - Runtime validation of API responses before they hit the UI.
  - Distinct handling of network/HTTP/validation errors in the client.
  - Safe behavior when the component unmounts during an in-flight request.

- **Defensive UI programming**
  - Skeleton loading state instead of empty content.
  - Friendly, recoverable error state with a Retry action.
  - Status indicator and last-updated timestamp so users understand data freshness.
