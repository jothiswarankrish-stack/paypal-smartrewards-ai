import { chromium } from "playwright";
import fs from "fs";
import path from "path";

// Helper for human-like typing
async function typeNaturally(page, selector, text) {
  await page.locator(selector).click();
  for (const char of text) {
    await page.keyboard.type(char, { delay: 60 });
  }
}

async function runDetailedDemoRecording() {
  console.log("🎬 Starting Detailed PayPal SmartRewards AI Mobile Demo Recording (Target ~2m 45s)...");

  const outputDir = path.resolve("e:/paypal/docs/demo_video");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    args: ["--window-size=500,1000"],
  });

  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: outputDir,
      size: { width: 430, height: 932 },
    },
  });

  const page = await context.newPage();

  console.log("Loading PayPal SmartRewards application...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // ==========================================
  // SCENE 1: HOME & 30-DAY SPENDING MODEL PROFILE (0:00 - 0:25)
  // ==========================================
  console.log("Scene 1: Customer A (Ananya Sharma) Profile & Model Inputs...");
  // Highlight balance and verified savings
  await page.locator('text=PayPal Balance & Savings').hover();
  await page.waitForTimeout(2000);

  // Scroll down to examine Category Spend Distribution & Recent Transactions
  await page.mouse.wheel(0, 360);
  await page.waitForTimeout(3000);
  
  // Hover over Donut Chart slices to show interactive tooltips
  const chartBox = await page.locator('.recharts-responsive-container').first().boundingBox();
  if (chartBox) {
    await page.mouse.move(chartBox.x + chartBox.width / 2, chartBox.y + chartBox.height / 2 - 20);
    await page.waitForTimeout(1500);
  }

  // Scroll down to recent transactions
  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(3000);
  await page.mouse.wheel(0, -710);
  await page.waitForTimeout(2000);

  // ==========================================
  // SCENE 2: DYNAMIC PERSONA DIFFERENTIATION (0:25 - 1:00)
  // ==========================================
  console.log("Scene 2: Demonstrating Dynamic ML Model Adaptation across Personas...");

  // Switch to Customer B: Rohan Verma (Commuter)
  console.log("Switching to Customer B (Rohan Verma - Taxi Commute)...");
  await page.locator('button:has-text("Rohan")').click();
  await page.waitForTimeout(4000); // Allow viewer to read context bar: Taxi & Commute • ₹7,000 / mo Uber
  // Scroll to show top recommendation: Uber Premier (30% OFF)
  await page.mouse.wheel(0, 280);
  await page.waitForTimeout(3500);
  await page.mouse.wheel(0, -280);
  await page.waitForTimeout(2000);

  // Switch to Customer C: Priya Nair (Fashion Shopper)
  console.log("Switching to Customer C (Priya Nair - Online Shopping)...");
  await page.locator('button:has-text("Priya")').click();
  await page.waitForTimeout(4000); // Context bar: Fashion & Shop • ₹8,000 / mo Myntra
  await page.mouse.wheel(0, 280);
  await page.waitForTimeout(3500);
  await page.mouse.wheel(0, -280);
  await page.waitForTimeout(2000);

  // Switch to Customer D: Rajesh Kumar (Groceries)
  console.log("Switching to Customer D (Rajesh Kumar - Daily Groceries)...");
  await page.locator('button:has-text("Rajesh")').click();
  await page.waitForTimeout(3500);

  // Return to Customer A for end-to-end PayPal Checkout
  console.log("Switching back to Customer A (Ananya Sharma) for live Checkout...");
  await page.locator('button:has-text("Ananya")').click();
  await page.waitForTimeout(3000);

  // ==========================================
  // SCENE 3: PAYPAL SANDBOX ORDERS API v2 CHECKOUT (1:00 - 1:40)
  // ==========================================
  console.log("Scene 3: Live PayPal Checkout with Safe Decimal Discount Validation...");
  const redeemBtn = page.locator('button:has-text("Redeem with PayPal")').first();
  await redeemBtn.click();
  await page.waitForTimeout(3000);

  // Demonstrate Interactive Cart Presets
  console.log("Interacting with order cart amounts...");
  await page.locator('button:has-text("₹1000")').click();
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("₹500")').click();
  await page.waitForTimeout(2500);

  // Select Optional Micro-Donation from Reward Balance (+₹10)
  console.log("Selecting optional ₹10 reward contribution...");
  await page.locator('.p-3.rounded-2xl button:has-text("+₹10")').click();
  await page.waitForTimeout(2500);

  // Step 1: Call Server Orders API v2 Order Creation
  console.log("Calling POST /v2/checkout/orders to initiate PayPal order...");
  await page.locator('button:has-text("Continue with PayPal")').click();
  await page.waitForTimeout(4000);

  // Step 2: Customer Approval & Verified Server Capture
  console.log("Calling POST /v2/checkout/orders/{id}/capture to settle payment...");
  await page.locator('button:has-text("Pay Now")').click();
  await page.waitForTimeout(5000);

  // Inspect Verified Digital Receipt
  console.log("Inspecting verified PayPal Sandbox receipt...");
  await page.waitForTimeout(4000);
  await page.locator('button:has-text("Back to Home")').click();
  await page.waitForTimeout(3000);

  // ==========================================
  // SCENE 4: AGENTIC COMMERCE AI ASSISTANT (1:40 - 2:05)
  // ==========================================
  console.log("Scene 4: Autonomous Agentic Commerce Copilot...");
  // Open floating AI assistant
  await page.locator('button:has-text("AI")').click();
  await page.waitForTimeout(3000);

  // Use natural language deal query
  console.log("Submitting natural language deal request...");
  await page.locator('button:has-text("Food under ₹500")').click();
  await page.waitForTimeout(5000);

  // Close AI Copilot sheet
  console.log("Closing AI Copilot...");
  await page.locator('.fixed.inset-0.z-50 button:has(svg.lucide-x)').click();
  await page.waitForTimeout(2000);

  // ==========================================
  // SCENE 5: REWARDS FOR GOOD & CAUSE VOTING (2:05 - 2:25)
  // ==========================================
  console.log("Scene 5: PayPal Rewards for Good & Global Giving Day...");
  await page.locator('nav button:has-text("Giving")').click();
  await page.waitForTimeout(3000);

  // Open Giving Day Cause Voting Modal
  console.log("Opening Democratized Cause Voting Modal...");
  await page.locator('button:has-text("Vote on Causes")').click();
  await page.waitForTimeout(3000);

  // Cast a Vote for Children's Education
  console.log("Voting for Education cause...");
  await page.locator('text=Children\'s Education').click();
  await page.waitForTimeout(2000);
  await page.locator('button:has-text("Cast My Cause Vote")').click();
  await page.waitForTimeout(3000);

  // Close Voting Modal
  await page.locator('button:has-text("Close")').click();
  await page.waitForTimeout(2000);

  // Interact with Reward Balance Conversion Panel
  console.log("Interacting with Reward Balance Conversion Panel...");
  await page.mouse.wheel(0, 320);
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("₹25")').click();
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -320);
  await page.waitForTimeout(2000);

  // ==========================================
  // SCENE 6: DEALS MARKETPLACE (2:25 - 2:40)
  // ==========================================
  console.log("Scene 6: Partner Deals Marketplace with Filter Pills...");
  await page.locator('nav button:has-text("Deals")').click();
  await page.waitForTimeout(3000);

  // Filter by Food
  await page.locator('button:has-text("Food")').click();
  await page.waitForTimeout(2500);

  // Filter by Rides
  await page.locator('button:has-text("Rides")').click();
  await page.waitForTimeout(2500);

  // Type in Search Bar
  await typeNaturally(page, 'input[placeholder*="Search partner deals"]', 'Uber');
  await page.waitForTimeout(3000);

  // Clear search
  await page.locator('input[placeholder*="Search partner deals"]').fill('');
  await page.locator('button:has-text("All")').click();
  await page.waitForTimeout(2000);

  // ==========================================
  // SCENE 7: AG GRID ENTERPRISE AUDIT & MERCHANT HUB (2:40 - 2:55)
  // ==========================================
  console.log("Scene 7: AG Grid Analytics, Audit Trails & Merchant Campaign Hub...");
  await page.locator('nav button:has-text("More")').click();
  await page.waitForTimeout(3500);

  // Demonstrate AG Grid Interactive Sorting & Quick Filtering
  console.log("Interacting with AG Grid table...");
  const agSearch = page.locator('input[placeholder*="Search in table"]');
  if (await agSearch.isVisible()) {
    await agSearch.click();
    await page.keyboard.type("Swiggy", { delay: 80 });
    await page.waitForTimeout(3000);
    await agSearch.fill("");
    await page.waitForTimeout(1500);
  }

  // Switch to Merchant Hub
  console.log("Toggling Merchant Hub...");
  await page.locator('button:has-text("Merchant Hub")').click();
  await page.waitForTimeout(3500);
  await page.mouse.wheel(0, 250);
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -250);
  await page.waitForTimeout(1500);

  // Switch to Platform Operations
  console.log("Toggling Admin Operations...");
  await page.locator('button:has-text("Operations")').click();
  await page.waitForTimeout(3500);

  // Return to Home for Conclusion
  console.log("Returning to Home screen...");
  await page.locator('nav button:has-text("Home")').click();
  await page.waitForTimeout(4000);

  console.log("Closing browser and finalizing video stream...");
  await context.close();
  await browser.close();

  console.log(`🎉 Comprehensive Demo Video Successfully Saved in: ${outputDir}`);
}

runDetailedDemoRecording().catch(console.error);
