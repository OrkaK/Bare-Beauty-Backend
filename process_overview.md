# Backend Verification Process Log

## Objective
Connect the `bare-beauty-backend` to a local Dockerized MongoDB instance, verify all API endpoints, and implement the Authentication system as requested.

## Step-by-Step Execution

### 1. Analysis & Preparation
**Action:** Analyzed the project structure (`list_dir`) and read `test-endpoints.js`.
**Finding:** The test script attempts to fetch products and calculate totals. Running it against an empty database would fail or produce unverified results.
**Decision:** I needed to populate (seed) the database with sample data before running tests.

### 2. Connection Verification
**Action:** Created `src/scripts/check-connection.js`.
**Tool Used:** `mongoose` (Node.js MongoDB driver).
**Why:** To isolate connection issues from application logic. If this script failed, I would know the issue was with the Docker container configuration or network, not the Express app.
**Result:** Connection to `mongodb://127.0.0.1:27017/bare-beauty` was successful.

### 3. Database Seeding
**Action:** Created `src/seed/seedData.js`.
**Implementation:**
- Defined sample `Products` (Lipstick, Serum, Mascara) matching the schema.
- Defined sample `Categories`.
- Wrote logic to `deleteMany({})` (clear old data) before `insertMany()` (adding new data) to ensure a clean state every time.
**Execution:** Ran `node src/seed/seedData.js`.
**Result:** Database was successfully populated with 3 products and 3 categories.

### 4. Integration Testing
**Action:** Started the server (`npm run dev`) and ran the test script (`node test-endpoints.js`).
**Tool Used:** `axios` (HTTP client in the test script) to make requests to `localhost:5001`.
**Observation:**
- **Product Catalog**: Returned the seeded items.
- **Cart/Checkout**: Successfully created orders (logic validated).
- **Reviews**: Successfully posted a review to a product ID retrieved from the seed data.
**Result:** "✅ ALL TESTS PASSED"

### 5. Authentication Implementation
**Action:** Designed and built the User Authentication system.
**Implementation:**
- **Schema**: Created `User.js` (with bcrypt hash) and `OTP.js`.
- **Dependencies**: Installed `bcryptjs` and `jsonwebtoken`.
- **Middleware**: Built `authMiddleware.js` to verify Bearer tokens.
- **Controller/Routes**: Implemented `signup`, `login`, `verify`, and `me` endpoints.
**Verification:**
- **Test Script**: Created `test-auth.js` to simulate the full auth flow (Signup -> Get Token -> Access Private Route -> Login -> Verify OTP).
**Challenges & Fixes:**
- **Mongoose Middleware Error**: Encountered `next is not a function` in the `pre('save')` hook.
    - *Cause*: Newer Mongoose versions expect async/await or a returned promise, not a callback for hooks.
    - *Fix*: Refactored the hook to use `async function()` and removed the `next` parameter.
- **Server Crash**: Server crashed during development due to a duplicate import.
    - *Fix*: Monitored logs, identified the `ReferenceError`, and corrected the `server.js` imports.

## Problem Solving & Tools

| Challenge | Solution | Tools/Techniques |
| **Empty Database** | The test script required existing products to query (e.g., getting a product ID to add to cart). Running it on an empty DB would cause errors. | **Solution:** Wrote a `seedData.js` script to verify the schema and populate the DB. |
| **Connection Configuration** | Needed to ensure the app connected to the Docker container. | **Solution:** Verified `.env` used `mongodb://127.0.0.1:27017`. Used `127.0.0.1` instead of `localhost` to avoid potential Node version resolution issues (IPv4 vs IPv6). |
| **Sequential Execution** | Seeding must complete before the server handles requests. | **Solution:** Ran scripts synchronously: Connection Check → Seed → Server Start → Test Script. |
| **Mongoose Middleware** | `next()` callback not supported in new Mongoose async hooks. | **Solution:** Refactored `userSchema.pre('save')` to use pure `async/await`. |

## Key Libraries Used
- **Mongoose**: For modeling and connecting to MongoDB.
- **Dotenv**: For loading the `MONGODB_URI` securely.
- **Axios**: For simulating client requests in the test suite.
- **Bcryptjs**: For secure password hashing.
- **JsonWebToken**: For stateless authentication.
