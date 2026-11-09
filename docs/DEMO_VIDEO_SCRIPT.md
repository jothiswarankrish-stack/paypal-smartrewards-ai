# PayPal SmartRewards AI — 3-Minute Demo Video Script

**Competition**: PayPal AI Hackathon 2026  
**Target Prizes**:
1. Best Use of PayPal + AI ($5,000)
2. Most Impactful ($5,000)
3. Best Use of AG Grid ($5,000)
4. Bonus: Best Use of Agentic Commerce ($5,000)  
**Total Target Runtime**: 2 minutes 50 seconds  

---

### [0:00 - 0:35] Scene 1: The Problem & The Solution
* **Visual**: Screen recording opens on the PayPal SmartRewards AI landing dashboard. Sleek fintech UI with navy and PayPal blue highlights.
* **Speaker**:
> "Traditional coupon systems broadcast the exact same generic discounts to everyone. Customers experience coupon fatigue, while merchants waste promotional budgets on unredeemed codes.
> Welcome to **PayPal SmartRewards AI** — an AI-powered personalized coupon and rewards platform built for the PayPal AI Hackathon 2026.
> Our application extracts RFM features from a customer's previous 30 days of transactions, computes multi-factor affinity scores, and delivers high-yield merchant discounts redeemable directly through the PayPal Developer Platform."

---

### [0:35 - 1:15] Scene 2: 1-Click Demographic Personas (Foodie vs Commuter vs Shopper)
* **Visual**: Camera zooms to the **1-Click Hackathon Persona Switcher** bar at the top of the app.
* **Speaker**:
> "Notice our global demo switcher bar. Let's start with **Customer A: Ananya Sharma**.
> Her 30-day transaction history totals ₹11,140, with ₹6,140 spent on food delivery (55.1%).
> Our Machine Learning engine immediately ranks **Swiggy Gourmet (25% OFF)** as her #1 match with a 93.4% confidence score. Look at the explanation: *'Food delivery is your #1 category, accounting for 55.1% of your spend...'*
> Now watch what happens when I switch to **Customer B: Rohan Verma** with a single click.
> Rohan spends ₹7,120 on taxi commutes. Instantly, the AI recalculates his recommendations: his top offer is now an **Uber 30% commute discount**!
> Switch to **Customer C: Priya Nair** — her ₹8,000 shopping spend instantly surfaces **Myntra Fashion 35% OFF**.
> These are genuine, data-driven machine learning calculations from database records, not static mockups."

---

### [1:15 - 1:55] Scene 3: PayPal Sandbox Orders API v2 Checkout
* **Visual**: Presenter clicks **"Redeem with PayPal"** on Customer A's Swiggy 25% OFF coupon card.
* **Speaker**:
> "Now let's see how PayPal is central to the checkout journey.
> When Ananya clicks 'Redeem with PayPal', our backend executes server-side validation:
> Checking minimum order requirements, expiration dates, and computing the exact discount using Decimal precision arithmetic. On a ₹500 order, she saves ₹125 instantly!
> Clicking 'Proceed' triggers our FastAPI backend to call the official **PayPal Orders API v2** (`POST /v2/checkout/orders`).
> The PayPal Sandbox Checkout opens. Upon buyer approval, our backend calls `POST /v2/checkout/orders/{id}/capture` to verify the payment.
> Once confirmed by PayPal, the order status updates to COMPLETED, the coupon redemption is registered, and Ananya's Lifetime Verified Savings increments live on her dashboard!"

---

### [1:55 - 2:25] Scene 4: Enterprise AG Grid Analytics & Customer Attraction Intelligence
* **Visual**: Presenter clicks the **"AG Grid Analytics"** tab. Shows the interactive AG Grid Community tables with sorting, filtering, and CSV export.
* **Speaker**:
> "For analytics, we integrated **AG Grid Community**.
> Judges can inspect the complete Customer Spending Ledger, Coupon Utilization Velocity, and Verified PayPal Redemptions Audit Trail with full column sorting, quick filtering, and CSV export.
> In our Admin center, Customer Attraction Intelligence tracks the full conversion funnel: impressions, clicks, coupon selections, and completed PayPal payments, proving uplift against controlled baseline cohorts."

---

### [2:25 - 2:50] Scene 5: Bonus Agentic Commerce Copilot & Conclusion
* **Visual**: Presenter toggles the **AI Shopping Copilot** drawer on the right. Types: *"I want food for ₹500"*.
* **Speaker**:
> "Finally, we built an **Agentic Commerce AI Copilot**.
> A customer can simply ask: *'I want food for ₹500'*. The agent autonomously parses their budget, scans active coupons, calculates net savings, and prepares an order for user approval before routing to PayPal Checkout.
> PayPal SmartRewards AI turns passive promotions into high-conversion checkout moments.
> Thank you!"

---

### Closing Title Card
- **PayPal SmartRewards AI**
- Live Demo: `http://localhost:3000` | API Docs: `http://localhost:8000/docs`
- GitHub Repository: Open-Source MIT License
