# PayPal SmartRewards AI — 3-Minute Demo Video Recording Playbook

**Target Length**: Exactly **2 minutes 45 seconds** (Hackathon rule: Must be strictly under 3 minutes).  
**Recording Tool**: Windows Game Bar (`Win + G` or `Win + Alt + R` to record) / OBS Studio / Loom.  
**Target View**: In Chrome, press `F12` and click the **Device Toggle icon** (set to **iPhone 14 Pro** or **430 × 932 px**) or keep the window centered on `http://localhost:3000`.

---

## 🎬 Master Recording Timeline & Script

```
0:00 ─── [Scene 1: Introduction & Problem] ─── 0:30
0:30 ─── [Scene 2: Dynamic Persona Differentiation] ─── 1:15
1:15 ─── [Scene 3: Complete PayPal Sandbox Checkout] ─── 1:55
1:55 ─── [Scene 4: AI Shopping Assistant & Giving] ─── 2:25
2:25 ─── [Scene 5: AG Grid Enterprise Analytics & Closing] ─── 2:45
```

---

### **[0:00 - 0:30] Scene 1: Introduction & Problem Statement**
* **What to Show on Screen**:
  * Open `http://localhost:3000` with the mobile view showing **Customer A (Ananya S.)**.
  * Show the top PayPal blue header, the balance card (`₹700.00 Total verified savings`), and the donut chart.
* **What to Say**:
  > *"Traditional promotional coupons broadcast identical, generic discounts to everyone, causing coupon fatigue for users and wasted spend for merchants.  
  > Welcome to **PayPal SmartRewards AI** — an AI-powered personalized rewards platform built for the PayPal AI Hackathon 2026.  
  > Designed natively for the PayPal mobile experience, our machine learning model evaluates 30 days of transaction history to deliver targeted, high-yield rewards redeemable through the official PayPal Developer Platform."*

---

### **[0:30 - 1:15] Scene 2: Dynamic Demo Persona Differentiation**
* **What to Show on Screen**:
  1. Highlight **Ananya S.** (Customer A):
     * Point out the context banner: `Food Delivery • ₹6,000 / mo Swiggy • AI Target: Swiggy Gourmet`.
     * Show her top recommendation: **Swiggy Gourmet (25% OFF)** with 93% match.
  2. Click **Rohan V.** (Customer B):
     * Watch the screen update: Greeting changes to *Welcome back, Rohan Verma*.
     * Context updates: `Taxi & Commute • ₹7,000 / mo Uber • AI Target: Uber Premier`.
     * Top card changes to: **Uber Premier (30% OFF)**.
  3. Click **Priya N.** (Customer C):
     * Context updates: `Fashion & Shop • ₹8,000 / mo Myntra`.
     * Top card changes to: **Myntra Clearance (35% OFF)**.
* **What to Say**:
  > *"Notice how the app dynamically adapts. For Customer A, Ananya Sharma, food delivery makes up over 55% of her monthly spending. The AI immediately surfaces Swiggy Gourmet at 25% OFF with natural language rationale.  
  > With a single tap, let's switch to Customer B: Rohan Verma.  
  > Rohan's transaction history is heavy on daily commute. Instantly, his balance, top category, and #1 AI recommendation shift to Uber Premier 30% OFF!  
  > Tap Customer C, Priya Nair — an online shopper — and her offers recalculate to Myntra Fashion 35% OFF.  
  > Every recommendation is mathematically derived in real-time from actual database transactions."*

---

### **[1:15 - 1:55] Scene 3: End-to-End PayPal Sandbox Checkout**
* **What to Show on Screen**:
  1. Click the gold **"Redeem with PayPal"** button on the top offer.
  2. The mobile slide-up checkout modal appears:
     * Show the itemized cart amount (`₹600`).
     * Show the server-calculated discount (`-₹150.00`).
     * Click **"Continue with PayPal"** (shows loading spinner).
  3. The approval step appears:
     * Point out the server-generated PayPal Order ID.
     * Click the official gold **"PayPal Pay Now"** button.
  4. The confirmed receipt displays:
     * Show the green checkmark: *Payment Successful!*
     * Show the verified **Capture ID** and saved discount.
  5. Click **"Back to Home"** and show the updated lifetime savings!
* **What to Say**:
  > *"Now let's complete a verified payment. When the user taps 'Redeem with PayPal', our FastAPI backend executes server-side validation using Decimal precision arithmetic.  
  > Tapping 'Continue' calls the official PayPal Orders API v2 to create order records server-to-server.  
  > When the buyer clicks the gold PayPal 'Pay Now' button, our backend captures the payment via `POST /v2/checkout/orders/{id}/capture`.  
  > Once verified directly against PayPal Sandbox, the transaction completes, issuing a verified receipt with Capture ID and atomically updating the user's lifetime savings ledger!"*

---

### **[1:55 - 2:25] Scene 4: AI Shopping Assistant & Rewards for Good**
* **What to Show on Screen**:
  1. Tap the floating **AI** button in the bottom right corner.
  2. The AI Shopping Assistant drawer slides up.
  3. Click the quick chip: **"Food under ₹500"** (or type it).
  4. The assistant responds with ranked deals and a **"Buy with PayPal"** CTA. Close the drawer.
  5. Tap the bottom **Giving** tab:
     * Show democratized cause voting (Hunger relief, Shelter).
     * Show the Points conversion panel (converting shopping points to charity or PayPal cash).
* **What to Say**:
  > *"For Agentic Commerce, users can tap our floating AI Assistant. Simply asking for 'Food under ₹500' prompts the autonomous copilot to parse budget intent, filter merchant rewards, calculate net savings, and prepare a PayPal order ready for 1-click buyer approval.  
  > In the Giving tab, PayPal's Global Giving Day allows customers to vote on causes and optionally convert shopping reward points into micro-donations or wallet cash."*

---

### **[2:25 - 2:45] Scene 5: Enterprise AG Grid Analytics & Conclusion**
* **What to Show on Screen**:
  1. Tap the bottom **More** tab.
  2. Click **Ledger & Data**:
     * Show the interactive **AG Grid Community** table (quick search `Swiggy`, sort columns, click **Export CSV**).
  3. Briefly toggle **Merchant Hub** to show active campaigns.
* **What to Say**:
  > *"Under the More tab, we integrated AG Grid Community for full auditing and transparency. Judges and merchants can sort, filter, and export the complete 30-day Customer Spending Ledger, Coupon Utilization rates, and PayPal Capture audit logs with one click.  
  > PayPal SmartRewards AI unites machine learning, agentic commerce, and the PayPal Developer Platform to turn passive rewards into verified checkouts.  
  > Thank you!"*

---

## 📌 Summary Checklist for YouTube Upload:
- [ ] **Video length**: Under 3 minutes (Target: ~2:45).
- [ ] **Resolution**: 1080p (Full HD).
- [ ] **Visibility**: Set to **Public** or **Unlisted** on YouTube.
- [ ] **Audio**: Clear microphone voiceover without copyrighted background music.
- [ ] **YouTube Link**: Paste the URL into your Devpost submission form.
