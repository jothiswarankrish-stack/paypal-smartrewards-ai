import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function runDemoRecording() {
  console.log("🎬 Starting PayPal SmartRewards AI Demo Recording...");

  const outputDir = path.resolve("e:/paypal/docs/demo_video");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false, // shows visible browser while recording
    args: ["--window-size=500,980"],
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

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  // --- SCENE 1: Home Dashboard (Customer A: Ananya S.) ---
  console.log("Scene 1: Customer A (Ananya Sharma - Foodie)...");
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(2000);

  // --- SCENE 2: Switch Personas Dynamically ---
  console.log("Scene 2: Switching to Customer B (Rohan Verma - Commuter)...");
  await page.click('button:has-text("Rohan")');
  await page.waitForTimeout(3500);

  console.log("Switching to Customer C (Priya Nair - Shopper)...");
  await page.click('button:has-text("Priya")');
  await page.waitForTimeout(3500);

  console.log("Switching back to Customer A for PayPal Checkout...");
  await page.click('button:has-text("Ananya")');
  await page.waitForTimeout(2500);

  // --- SCENE 3: PayPal Sandbox Orders API v2 Checkout ---
  console.log("Scene 3: Triggering PayPal Checkout Modal...");
  const redeemBtn = page.locator('button:has-text("Redeem with PayPal")').first();
  await redeemBtn.click();
  await page.waitForTimeout(2000);

  console.log("Proceeding to PayPal Sandbox...");
  await page.click('button:has-text("Continue with PayPal")');
  await page.waitForTimeout(3000);

  console.log("Capturing PayPal Payment (POST /v2/checkout/orders/{id}/capture)...");
  await page.click('button:has-text("Pay Now")');
  await page.waitForTimeout(4000);

  console.log("Closing receipt...");
  await page.click('button:has-text("Back to Home")');
  await page.waitForTimeout(2000);

  // --- SCENE 4: AI Shopping Assistant ---
  console.log("Scene 4: Launching Agentic Commerce Assistant...");
  // Click floating AI button
  await page.click('button:has-text("AI")');
  await page.waitForTimeout(2000);

  console.log("Asking copilot for Food under ₹500...");
  await page.click('button:has-text("Food under ₹500")');
  await page.waitForTimeout(4000);

  // Close AI drawer
  await page.click('button:has(svg.lucide-x)');
  await page.waitForTimeout(1500);

  // --- SCENE 5: Giving & Rewards for Good ---
  console.log("Scene 5: Exploring Giving & Rewards for Good...");
  await page.click('nav button:has-text("Giving")');
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(1500);

  // --- SCENE 6: Deals Tab ---
  console.log("Scene 6: Exploring Partner Deals Tab...");
  await page.click('nav button:has-text("Deals")');
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(2000);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(1500);

  // --- SCENE 7: AG Grid Analytics (More Tab) ---
  console.log("Scene 7: AG Grid Analytics Ledger & Audit Trail...");
  await page.click('nav button:has-text("More")');
  await page.waitForTimeout(3000);

  // Switch to Merchant Hub
  await page.click('button:has-text("Merchant Hub")');
  await page.waitForTimeout(2500);

  // Return to Home
  await page.click('nav button:has-text("Home")');
  await page.waitForTimeout(3000);

  console.log("Closing browser and saving recorded video...");
  await context.close();
  await browser.close();

  console.log(`✅ Demo Recording Saved to: ${outputDir}`);
}

runDemoRecording().catch(console.error);
