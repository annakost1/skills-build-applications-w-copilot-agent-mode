# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Implement route-specific React pages under `octofit-tracker/frontend/src` using the shared API client. Each capability will render loading, success, empty, and accessible error states, with React Router mapping `/activities`, `/teams`, `/leaderboard`, and `/workouts`.
- Logic tier decision: Keep Express route handlers thin and place validation, reference checks, ranking, and workout-selection behavior in explicit TypeScript services. Return deliberate 4xx responses for invalid input, missing records, and malformed IDs.
- Data tier decision: Define required Mongoose schema fields and ObjectId references in the four models, then seed stable demo data with upserts. Preserve unrelated records, retain existing team records, and reconcile the demo user's membership when its team changes.
- Activity tracking approach: Validate `userId` and `teamId` before casting or querying, require an existing user and team, validate activity fields through Mongoose, compute `points` from the submitted activity, and set `occurredAt` when creating the record.
- Team management approach: Require `name` and `mascot` in the API and model, default `members` to an empty array, preserve submitted members, and expose member ObjectIds in list and create responses.
- Leaderboard approach: Aggregate activity points by team and sort descending by `totalPoints`; attach a 1-based rank to each entry and expose `teamName`, `totalPoints`, and `rank`.
- Workout suggestions approach: Find the user by email and their recent activities, then select a workout whose focus matches their fitness goal or recent activity pattern. Include a reason tied to that match and return a 4xx for an unknown email.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Establishes required Mongoose validation and seed behavior. Initial status: 4 of 5 tests fail because User, Team, Activity, and Workout required fields are missing; the idempotent seed test passes.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Establishes Express route behavior, 4xx input handling, and service results. Initial status: 4 of 4 tests fail because activity/team routes return placeholders, leaderboard is empty, and workout suggestions are not personalized.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Establishes route rendering, shared API calls, and loading/empty/error states. Initial status: 15 of 15 tests fail because the presentation contract is incomplete.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Verifies that the data, services, routes, and TypeScript types compile. Run after the API contract passes.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Verifies that the React route and API implementation compile and produce a deployable Vite build. Run after the frontend contract passes.

Implementation order:

1. Complete Mongoose model validation and stable seed data in the data tier.
2. Run the data contract tests, then implement backend services and route handlers from bottom to top.
3. Run the API contract tests, then verify the backend build.
4. Implement the shared API client and presentation routes, states, and components.
5. Run the frontend contract tests, then verify the frontend build.
