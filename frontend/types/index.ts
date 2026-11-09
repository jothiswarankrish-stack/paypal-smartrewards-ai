export type UserRole = "customer" | "merchant" | "admin";

export interface CustomerProfile {
  persona_name: string;
  persona_description?: string;
  monthly_budget: number;
  preferred_payment_method: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  customer_profile?: CustomerProfile;
}

export interface SpendingCategoryBreakdown {
  category: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  top_merchant?: string;
}

export interface Transaction {
  id: string;
  merchant_name: string;
  category: string;
  amount: number;
  currency: string;
  payment_channel: string;
  timestamp: string;
  is_synthetic: boolean;
}

export interface SpendingInsights {
  customer_id: string;
  customer_name: string;
  persona_name: string;
  total_spent_30d: number;
  currency: string;
  highest_category: string;
  category_breakdown: SpendingCategoryBreakdown[];
  recent_transactions: Transaction[];
  total_savings_lifetime: number;
}

export interface Coupon {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  code: string;
  title: string;
  description: string;
  category: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  expiry_date: string;
  usage_limit: number;
  times_used: number;
  is_active: boolean;
  created_at?: string;
}

export interface RecommendationItem {
  id: string;
  coupon: Coupon;
  match_score: number;
  rank: number;
  rationale: string;
  category_relevance: number;
  savings_potential_estimate: number;
  attraction_tag?: string;
}

export interface RecommendationResponse {
  customer_id: string;
  persona: string;
  recommendations: RecommendationItem[];
  model_version: string;
  explanation_source: string;
}

export interface PayPalCreateOrderResponse {
  order_id: string;
  status: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  currency: string;
  approve_url?: string;
  coupon_code?: string;
}

export interface PayPalCaptureResponse {
  success: boolean;
  order_id: string;
  capture_id?: string;
  status: string;
  final_amount: number;
  discount_saved: number;
  currency: string;
  payer_email?: string;
  message: string;
}

export interface MerchantStats {
  merchant_id: string;
  business_name: string;
  category: string;
  active_coupons_count: number;
  total_redemptions: number;
  total_sales_generated: number;
  total_discounts_given: number;
  conversion_rate: number;
  recent_redemptions: Array<{
    id: string;
    customer_id: string;
    coupon_code: string;
    amount_saved: number;
    redeemed_at: string;
  }>;
}

export interface AdminPlatformStats {
  total_users: number;
  total_merchants: number;
  total_coupons: number;
  total_transactions: number;
  total_redemptions: number;
  total_volume_processed: number;
  total_customer_savings: number;
  paypal_conversion_rate: number;
  ai_recommendation_click_through_rate: number;
}

export interface CohortItem {
  cohort_name: string;
  sample_size: number;
  redemption_rate: number;
  avg_order_value: number;
  paypal_retention_lift: number;
  description: string;
}

export interface DealProposal {
  coupon_id: string;
  coupon_title: string;
  merchant_name: string;
  original_price: number;
  discount_amount: number;
  final_price: number;
  savings_percentage: number;
  rationale: string;
}

export interface AgentChatResponse {
  reply: string;
  suggested_deals: DealProposal[];
  action_type?: string;
  order_intent?: {
    coupon_id: string;
    coupon_title?: string;
    merchant_name?: string;
    original_amount: number;
    discount_amount: number;
    final_amount: number;
    currency: string;
  };
}

// --- Rewards for Good & Global Giving Day Types ---
export interface DonationBeneficiary {
  id: string;
  name: string;
  category: string;
  description: string;
  impact_summary?: string;
  logo_url?: string;
  paypal_charity_id?: string;
  hosted_button_id?: string;
  total_received: number;
  donor_count: number;
  is_active: boolean;
}

export interface CustomerRewardBalance {
  customer_id: string;
  available_reward_points: number;
  total_donated: number;
  total_cash_redeemed: number;
  currency: string;
  last_updated: string;
}

export interface DonationReceipt {
  success: boolean;
  receipt_id: string;
  customer_id: string;
  beneficiary_id?: string;
  beneficiary_name?: string;
  donation_amount: number;
  cash_redeemed: number;
  remaining_balance: number;
  currency: string;
  source_type: string;
  paypal_reference_id: string;
  status: string;
  timestamp: string;
  message: string;
}

export interface SocialImpactBeneficiaryStat {
  beneficiary_id: string;
  name: string;
  category: string;
  total_received: number;
  donor_count: number;
  percentage_of_total: number;
}

export interface SocialImpactRecentDonation {
  id: string;
  customer_name: string;
  beneficiary_name: string;
  amount: number;
  currency: string;
  source_type: string;
  paypal_reference_id: string;
  timestamp: string;
}

export interface SocialImpactStats {
  total_donated: number;
  total_donors_count: number;
  avg_donation_amount: number;
  currency: string;
  beneficiaries: SocialImpactBeneficiaryStat[];
  recent_donations: SocialImpactRecentDonation[];
}
