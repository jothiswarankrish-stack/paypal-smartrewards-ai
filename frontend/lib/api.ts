import {
  User,
  SpendingInsights,
  RecommendationResponse,
  Coupon,
  PayPalCreateOrderResponse,
  PayPalCaptureResponse,
  MerchantStats,
  AdminPlatformStats,
  CohortItem,
  AgentChatResponse,
  Transaction,
  DonationBeneficiary,
  CustomerRewardBalance,
  DonationReceipt,
  SocialImpactStats,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function demoLogin(persona: string): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/demo-login/${persona}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Demo login failed");
  return res.json();
}

export async function getSpendingInsights(customerId: string): Promise<SpendingInsights> {
  const res = await fetch(`${API_BASE}/api/customer/insights/${customerId}`);
  if (!res.ok) throw new Error("Failed to load spending insights");
  return res.json();
}

export async function getCustomerTransactions(customerId: string, category?: string): Promise<Transaction[]> {
  const url = category && category !== "all"
    ? `${API_BASE}/api/customer/transactions/${customerId}?category=${category}`
    : `${API_BASE}/api/customer/transactions/${customerId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load transactions");
  return res.json();
}

export async function getRecommendations(customerId: string): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/api/recommendations/${customerId}`);
  if (!res.ok) throw new Error("Failed to load AI recommendations");
  return res.json();
}

export async function logRecommendationEvent(customerId: string, couponId: string, eventType: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/recommendations/event?customer_id=${customerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coupon_id: couponId, event_type: eventType }),
    });
  } catch (err) {
    console.error("Failed to log event:", err);
  }
}

export async function getCoupons(category?: string, search?: string): Promise<Coupon[]> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  if (search) params.append("search", search);

  const res = await fetch(`${API_BASE}/api/coupons?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load coupons");
  return res.json();
}

export async function validateCoupon(couponId: string, cartAmount: number) {
  const res = await fetch(`${API_BASE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coupon_id: couponId, cart_amount: cartAmount }),
  });
  if (!res.ok) throw new Error("Coupon validation failed");
  return res.json();
}

export async function createPayPalOrder(
  customerId: string,
  couponId: string | null,
  originalAmount: number,
  currency = "USD"
): Promise<PayPalCreateOrderResponse> {
  const res = await fetch(`${API_BASE}/api/paypal/create-order?customer_id=${customerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coupon_id: couponId,
      original_amount: originalAmount,
      currency: currency,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "PayPal Order Creation failed");
  }
  return res.json();
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const res = await fetch(`${API_BASE}/api/paypal/capture-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Payment capture failed");
  }
  return res.json();
}

export async function getCustomerOrders(customerId: string) {
  const res = await fetch(`${API_BASE}/api/paypal/orders/${customerId}`);
  if (!res.ok) throw new Error("Failed to load PayPal order history");
  return res.json();
}

export async function getMerchantStats(merchantId: string): Promise<MerchantStats> {
  const res = await fetch(`${API_BASE}/api/merchant/${merchantId}/stats`);
  if (!res.ok) throw new Error("Failed to load merchant stats");
  return res.json();
}

export async function getMerchantCoupons(merchantId: string): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE}/api/merchant/${merchantId}/coupons`);
  if (!res.ok) throw new Error("Failed to load merchant coupons");
  return res.json();
}

export async function createCoupon(data: any): Promise<Coupon> {
  const res = await fetch(`${API_BASE}/api/merchant/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create coupon");
  }
  return res.json();
}

export async function toggleCouponStatus(couponId: string) {
  const res = await fetch(`${API_BASE}/api/merchant/coupons/${couponId}/toggle`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to toggle coupon status");
  return res.json();
}

export async function getAdminStats(): Promise<AdminPlatformStats> {
  const res = await fetch(`${API_BASE}/api/admin/stats`);
  if (!res.ok) throw new Error("Failed to load admin stats");
  return res.json();
}

export async function getAdminCohorts(): Promise<CohortItem[]> {
  const res = await fetch(`${API_BASE}/api/admin/cohorts`);
  if (!res.ok) throw new Error("Failed to load cohort analytics");
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/api/admin/reset-demo`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset demo data");
  return res.json();
}

export async function getSpendingGrid(customerId?: string) {
  const url = customerId ? `${API_BASE}/api/analytics/spending-grid?customer_id=${customerId}` : `${API_BASE}/api/analytics/spending-grid`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load spending grid");
  return res.json();
}

export async function getCouponsGrid() {
  const res = await fetch(`${API_BASE}/api/analytics/coupons-grid`);
  if (!res.ok) throw new Error("Failed to load coupons grid");
  return res.json();
}

export async function getRedemptionsGrid() {
  const res = await fetch(`${API_BASE}/api/analytics/redemptions-grid`);
  if (!res.ok) throw new Error("Failed to load redemptions grid");
  return res.json();
}

export async function getMerchantsGrid() {
  const res = await fetch(`${API_BASE}/api/analytics/merchants-grid`);
  if (!res.ok) throw new Error("Failed to load merchants grid");
  return res.json();
}

export async function sendAgentMessage(message: string, customerId?: string): Promise<AgentChatResponse> {
  const res = await fetch(`${API_BASE}/api/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, customer_id: customerId }),
  });
  if (!res.ok) throw new Error("Agentic commerce copilot error");
  return res.json();
}

// --- Rewards for Good & Global Giving Day APIs ---
export async function getDonationBeneficiaries(): Promise<DonationBeneficiary[]> {
  const res = await fetch(`${API_BASE}/api/donations/beneficiaries`);
  if (!res.ok) throw new Error("Failed to load donation beneficiaries");
  return res.json();
}

export async function getCustomerRewardBalance(customerId: string): Promise<CustomerRewardBalance> {
  const res = await fetch(`${API_BASE}/api/donations/customer-balance/${customerId}`);
  if (!res.ok) throw new Error("Failed to load customer reward balance");
  return res.json();
}

export async function contributeDonation(payload: {
  customer_id: string;
  beneficiary_id: string;
  amount: number;
  currency?: string;
  customer_consent: boolean;
  source_type?: string;
}): Promise<DonationReceipt> {
  const res = await fetch(`${API_BASE}/api/donations/contribute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Donation failed");
  }
  return res.json();
}

export async function convertRewardsToCash(payload: {
  customer_id: string;
  amount_to_redeem: number;
  donation_amount?: number;
  beneficiary_id?: string;
  customer_consent?: boolean;
  currency?: string;
}): Promise<DonationReceipt> {
  const res = await fetch(`${API_BASE}/api/donations/convert-cash`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Cash conversion failed");
  }
  return res.json();
}

export async function getSocialImpactStats(): Promise<SocialImpactStats> {
  const res = await fetch(`${API_BASE}/api/donations/analytics`);
  if (!res.ok) throw new Error("Failed to load social impact statistics");
  return res.json();
}

