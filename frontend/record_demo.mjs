import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function runDemoRecording() {
  console.log("🎬 Starting Smooth PayPal SmartRewards AI Mobile Demo Recording...");

  const outputDir = path.resolve("e:/paypal/docs/demo_video");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
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

  console.log("Loading PayPal SmartRewards mobile UI...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);

  // --- SCENE 1: Welcome & Overview (Customer A - Foodie) ---
  console.log("Scene 1: Customer A (Ananya Sharma - Foodie)...");
  await page.mouse.wheel(0, 320);
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -320);
  await page.waitForTimeout(2000);

  // --- SCENE 2: Switch Personas Dynamically ---
  console.log("Scene 2: Switching to Customer B (Rohan Verma - Commute)...");
  await page.locator('button:has-text("Rohan")').click();
  await page.waitForTimeout(3000);

  console.log("Switching to Customer C (Priya Nair - Fashion & Shopping)...");
  await page.locator('button:has-text("Priya")').click();
  await page.waitForTimeout(3000);

  console.log("Switching back to Customer A for checkout demonstration...");
  await page.locator('button:has-text("Ananya")').click();
  await page.waitForTimeout(2500);

  // --- SCENE 3: PayPal Sandbox Orders API v2 Checkout ---
  console.log("Scene 3: Opening PayPal Checkout Modal...");
  await page.locator('button:has-text("Redeem with PayPal")').first().click();
  await page.waitForTimeout(2500);

  console.log("Initiating server-to-server PayPal Order Creation...");
  await page.locator('button:has-text("Continue with PayPal")').click();
  await page.waitForTimeout(3000);

  console.log("Capturing PayPal Sandbox Order (POST /v2/checkout/orders/{id}/capture)...");
  await page.locator('button:has-text("Pay Now")').click();
  await page.waitForTimeout(4000);

  console.log("Returning to dashboard with updated verified savings...");
  await page.locator('button:has-text("Back to Home")').click();
  await page.waitForTimeout(2500);

  // --- SCENE 4: Agentic Commerce AI Shopping Assistant ---
  console.log("Scene 4: Opening AI Shopping Assistant...");
  await page.locator('button:has-text("AI")').click();
  await page.waitForTimeout(2500);

  console.log("Querying Copilot: Food under ₹500...");
  await page.locator('button:has-text("Food under ₹500")').click();
  await page.waitForTimeout(4000);

  // Close AI drawer cleanly via top header close button
  console.log("Closing AI Assistant...");
  await page.locator('.fixed.inset-0.z-50 button:has(svg.lucide-x)').click();
  await page.waitForTimeout(2000);

  // --- SCENE 5: Rewards for Good & Global Giving Day ---
  console.log("Scene 5: Rewards for Good (Giving Tab)...");
  await page.locator('nav button:has-text("Giving")').click();
  await page.waitForTimeout(3000);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(2000);

  // --- SCENE 6: Deals Marketplace ---
  console.log("Scene 6: Partner Deals Marketplace...");
  await page.locator('nav button:has-text("Deals")').click();
  await page.waitForTimeout(3000);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(2500);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(2000);

  // --- SCENE 7: AG Grid Analytics Ledger & Audit ---
  console.log("Scene 7: AG Grid Analytics Ledger...");
  await page.locator('nav button:has-text("More")').click();
  await page.waitForTimeout(3500);

  // Merchant Hub Tab
  console.log("Viewing Merchant Campaign Hub...");
  await page.locator('button:has-text("Merchant Hub")').click();
  await page.waitForTimeout(3000);

  // Return to Home for final view
  console.log("Returning to Home...");
  await page.locator('nav button:has-text("Home")').click();
  await page.waitForTimeout(3500);

  console.log("Closing browser and finalizing video stream...");
  await context.close();
  await browser.close();

  console.log(`🎉 Demo Video Recording Successfully Created in: ${outputDir}`);
}

runDemoRecording().catch(console.error);
