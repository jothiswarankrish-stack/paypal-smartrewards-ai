# Open-Source Repository Audit

**Project**: PayPal SmartRewards AI  
**Event**: PayPal AI Hackathon 2026  
**Date**: November 2026  
**Auditor**: Senior Software Architecture & Integration Team  

---

## 1. Executive Summary

As required by Phase 1 of the development execution instructions, we inspected the five candidate open-source repositories to evaluate their viability, architectural alignment, licensing restrictions, security posture, and suitability for reuse in **PayPal SmartRewards AI**.

| Repository | URL | License | Stack | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **PayPal Next.js Example** | `paypal-examples/nextjs-paypal-template` | MIT / Apache 2.0 | Next.js, TypeScript, Tailwind | **ADAPT** |
| **Retail Coupon Recommendation** | `AsmirMumin/Retail-Coupon-Recommendation-for-Revenue-Optimization` | MIT / Academic | Python, Pandas, Scikit-learn | **ADAPT** |
| **Personalized Promotion System** | `cepdnaclk/e19-co544-personalised-promotion-system` | Academic | Python / ML | **REFERENCE ONLY** |
| **Recopulse** | `ashik-2516/Recopulse` | Unavailable | N/A | **REJECT** (Unavailable) |
| **PayPal Sample App** | `apimatic/paypal-sample-app` | MIT | TypeScript, Express | **ADAPT** |

---

## 2. In-Depth Repository Analysis

### Repository 1: `paypal-examples/nextjs-paypal-template`
* **URL**: https://github.com/paypal-examples/nextjs-paypal-template
* **License**: MIT
* **Main Technologies**: Next.js, React, TypeScript, Tailwind CSS, `@paypal/react-paypal-js`
* **Reusable Components**:
  - Clean client-side integration of PayPal Smart Payment Buttons.
  - Integration of `@paypal/react-paypal-js` Provider wrapper.
  - Separation of public client ID and protected backend order creation endpoints.
* **Limitations**:
  - Geared toward static e-commerce products without personalized AI coupon logic.
  - Uses basic Next.js API routes instead of a high-performance Python FastAPI recommendation service.
* **Security Concerns**:
  - Ensure client secret is never included in Next.js environment bundles (`NEXT_PUBLIC_` prefix strictly omitted for secrets).
* **Verdict**: **ADAPT**. We utilize the client-side checkout flow and PayPal SDK provider integration in our Next.js frontend, routing order creation and capture to our FastAPI backend.

---

### Repository 2: `AsmirMumin/Retail-Coupon-Recommendation-for-Revenue-Optimization`
* **URL**: https://github.com/AsmirMumin/Retail-Coupon-Recommendation-for-Revenue-Optimization
* **License**: MIT / Open Research
* **Main Technologies**: Python, Pandas, NumPy, Scikit-learn, XGBoost, LightGBM
* **Reusable Components**:
  - RFM (Recency, Frequency, Monetary) feature extraction logic from historical customer transaction logs.
  - Customer purchase affinity modeling across retail categories.
  - Price-elasticity and discount depth scoring.
* **Limitations**:
  - Designed as offline Jupyter notebooks and batch ML scripts rather than a low-latency REST API service.
  - Lacks database schema, real-time user session context, and payment integration.
* **Security Concerns**:
  - Direct pickle/joblib file deserialization in uncurated environments; we replace with clean vectorized feature extraction directly inside Python memory.
* **Verdict**: **ADAPT**. We adapt the 30-day RFM mathematical formulations and category affinity calculations into our production `RecommendationEngine` service in FastAPI.

---

### Repository 3: `cepdnaclk/e19-co544-personalised-promotion-system`
* **URL**: https://github.com/cepdnaclk/e19-co544-personalised-promotion-system
* **License**: Educational / Academic
* **Main Technologies**: Python, Machine Learning
* **Reusable Components**:
  - Coupon metadata specifications (minimum spend, validity windows, category segmentation).
* **Limitations**:
  - University student batch project; lacks modular micro-architecture and test suites.
  - Visibility restricted/internal.
* **Security Concerns**:
  - Untracked dependencies and unmaintained packages.
* **Verdict**: **REFERENCE ONLY**. We reference coupon schema fields but implement our own production database models and validation engine.

---

### Repository 4: `ashik-2516/Recopulse`
* **URL**: https://github.com/ashik-2516/Recopulse
* **License**: N/A
* **Main Technologies**: N/A
* **Status**: Repository is private, deleted, or does not exist on GitHub.
* **Verdict**: **REJECT**. Per project rules, we do not block development; we proceed using official Scikit-learn algorithms and modern FastAPI architectures.

---

### Repository 5: `apimatic/paypal-sample-app`
* **URL**: https://github.com/apimatic/paypal-sample-app
* **License**: MIT
* **Main Technologies**: TypeScript, Express, PayPal REST APIs
* **Reusable Components**:
  - Two-step server-side payment lifecycle: Order Creation (`POST /v2/checkout/orders`) followed by Authorized Capture (`POST /v2/checkout/orders/{id}/capture`).
  - Strict payload validation and PayPal Sandbox credential verification.
* **Limitations**:
  - Built with Express/Node.js rather than Python; stores products in transient memory rather than a transactional database.
* **Security Concerns**:
  - Lack of idempotency protection and atomic transaction safeguards for coupon redemption.
* **Verdict**: **ADAPT**. We adapt the server-side PayPal REST v2 API contracts, error handling, and sandbox status verification into our Python FastAPI payment service, using Decimal-safe monetary arithmetic and database constraints.

---

## 3. Final Architectural Conclusion

We combine the best elements from the verified repositories:
1. **Frontend**: Next.js + TypeScript + Tailwind CSS with PayPal JS SDK buttons (adapted from `paypal-examples/nextjs-paypal-template`).
2. **AI Engine**: Python Scikit-learn + Pandas 30-day RFM category affinity and cosine ranking (adapted from `Retail-Coupon-Recommendation-for-Revenue-Optimization`).
3. **Payment Security**: Server-to-server PayPal Sandbox Orders v2 creation and capture verification (adapted from `apimatic/paypal-sample-app`).
4. **Data Analytics**: AG Grid Community tables for spending insights, merchant performance, and platform monitoring.
