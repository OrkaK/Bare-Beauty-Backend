# Bare Beauty Backend - Master Implementation Guide

This document serves as the simplified technical manual for the Bare Beauty backend. It details the system architecture, core design decisions, and active feature implementations.

---

## 1. Core Architecture & Stack

- **Node.js & Express.js**: Our core framework for handling fast, concurrent API requests.
- **MongoDB + Mongoose**: A flexible NoSQL database allowing dynamic product attributes (e.g., `skinType`, `variants`).
- **JWT (JSON Web Tokens)**: Secure, stateless authentication.
- **Security**: 
  - Passwords are securely hashed using `bcryptjs`.
  - JWTs are stored in HTTP-Only cookies to protect against cross-site scripting (XSS).
  - All sensitive keys are hidden in a `.env` file.

---

## 2. Feature Deep-Dive

### A. Authentication & User Management
- **Registration**: Validates input, hashes the password, and creates the User document.
- **Login**: Compares the hashed password, signs a JWT, and securely sets it as a cookie.
- **Verification**: Built an OTP (One Time Password) model to securely verify Emails and SMS.

### B. Smart Recommendations Engine
- **Implementation**: The backend parses a user's preferences (like "Oily Skin" or "Acne") and algorithms intelligently score and sort the database products.
- **Result**: The highest-scoring products dynamically float to the top of the user's feed for a personalized shopping experience.

### C. Artificial Intelligence (Mock)
- **Flow**: A user uploads a selfie -> The backend analyzes the image -> Safely updates the User Profile.
- **Implementation**: Computes baseline attributes (like Shade and Undertone) to immediately improve the Smart Recommendation models.

### D. Commerce Engine
- **Product Catalog**: Heavily paginated database endpoints handling dynamic UI requests.
- **Stripe Integration**: Full order lifecycle mapping with Stripe payment intents, smoothly capturing revenue.

---

## 3. Notable Challenges Resolved

- **Challenge 1: Connection Timeouts** 
  - **Fix**: Replaced generic `localhost` targets with explicit IP definitions (`127.0.0.1:27017`) to bypass MacOS IPv6 resolution delays.
- **Challenge 2: Redis Cache Flooding**
  - **Fix**: Safely disabled aggressive cache reconnect loops that were overwhelming the Node Event Loop when Redis was absent, completely stabilizing the Express API.
- **Challenge 3: Mongoose Hook Errors**
  - **Fix**: Refactored deprecated async `next()` callbacks into modern pure `async/await` Promises for password hashing.

---

## 4. Verification & Testing Strategy

We rely on dedicated verification scripts to simulate payload mappings and guarantee a stable pipeline.

| Script Filename | Feature Verified |
| :--- | :--- |
| `seedData.js` | Clears and populates the database with initial catalog entities for testing. |
| `test-endpoints.js` | Validates basic API health (Auth, Products, Cart). |
| `test-recommendations.js` | Tests the Smart algorithm logic (User Preferences -> Product Scoring). |
| `test-sms.js` | Tests SMS OTP generation and Verification logic. |

---

## 5. Future Roadmap
- **Real AI**: Replace local node simulation with a dedicated machine learning cluster.
- **Real Comm integrations**: Finalize Twilio endpoints for live, production SMS alerts.
