"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import DemoPersonaBar from "../components/DemoPersonaBar";
import CustomerDashboardView from "../components/CustomerDashboardView";
import RecommendationsView from "../components/RecommendationsView";
import MarketplaceView from "../components/MarketplaceView";
import AnalyticsView from "../components/AnalyticsView";
import MerchantView from "../components/MerchantView";
import AdminView from "../components/AdminView";
import PayPalCheckoutModal from "../components/PayPalCheckoutModal";
import AgenticCommerceDrawer from "../components/AgenticCommerceDrawer";
import GlobalGivingDayBanner from "../components/GlobalGivingDayBanner";
import GlobalGivingDayModal from "../components/GlobalGivingDayModal";
import SocialImpactView from "../components/SocialImpactView";
import { Bell, Sparkles } from "lucide-react";

import {
  demoLogin,
  getSpendingInsights,
  getRecommendations,
  getCoupons,
} from "../lib/api";
import { User, SpendingInsights, RecommendationResponse, Coupon } from "../types";

export default function Home() {
  const [currentPersonaKey, setCurrentPersonaKey] = useState<string>("customer_a");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Data states
  const [spendingInsights, setSpendingInsights] = useState<SpendingInsights | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Modals & Drawers
  const [selectedCouponForCheckout, setSelectedCouponForCheckout] = useState<Coupon | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState<boolean>(false);
  const [isGivingDayModalOpen, setIsGivingDayModalOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize with Customer A on load
  useEffect(() => {
    switchPersona("customer_a");
  }, []);

  const switchPersona = async (personaKey: string) => {
    setIsLoading(true);
    setCurrentPersonaKey(personaKey);
    try {
      const loginResp = await demoLogin(personaKey);
      const user = loginResp.user;
      setCurrentUser(user);

      if (user.role === "merchant") {
        setActiveTab("merchant");
      } else if (user.role === "admin") {
        setActiveTab("admin");
      } else {
        if (activeTab === "merchant" || activeTab === "admin") {
          setActiveTab("dashboard");
        }
        await loadCustomerData(user.id);
      }
    } catch (err) {
      console.error("Failed to switch persona:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerData = async (customerId: string) => {
    try {
      const [insights, recs, allCoupons] = await Promise.all([
        getSpendingInsights(customerId),
        getRecommendations(customerId),
        getCoupons(),
      ]);
      setSpendingInsights(insights);
      setRecommendations(recs);
      setCoupons(allCoupons);
    } catch (err) {
      console.error("Failed to load customer data:", err);
    }
  };

  const handleOpenCheckout = (coupon: Coupon) => {
    setSelectedCouponForCheckout(coupon);
    setIsCheckoutModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (currentUser && currentUser.role === "customer") {
      loadCustomerData(currentUser.id);
    }
  };

  const handleFilterChange = async (category: string, search: string) => {
    try {
      const filtered = await getCoupons(category, search);
      setCoupons(filtered);
    } catch (err) {
      console.error("Failed to filter coupons:", err);
    }
  };

  return (
    <div className="app-shell flex flex-col font-sans">
      {/* Top Mobile PayPal Header */}
      <header className="sticky top-0 z-40 bg-[#003087] text-white px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
            <span className="font-black text-lg italic text-[#003087] leading-none">P</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="font-black text-white text-base tracking-tight">PayPal</span>
              <span className="font-medium text-[#70BAFF] text-xs">Rewards</span>
            </div>
          </div>
        </div>

        {/* Right actions: notification + profile avatar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsGivingDayModalOpen(true)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:bg-white/20 transition-all"
            title="Global Giving"
          >
            <Sparkles className="w-4 h-4 text-[#FFC439]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0070E0] to-[#009CDE] text-white font-bold text-xs flex items-center justify-center border border-white/20 shadow-xs">
            {currentUser?.full_name?.charAt(0) || "P"}
          </div>
        </div>
      </header>

      {/* Global Giving Day Slim Banner */}
      <GlobalGivingDayBanner
        onOpenGivingDayModal={() => setIsGivingDayModalOpen(true)}
        onNavigateToGivingTab={() => setActiveTab("giving_day")}
      />

      {/* Compact Demo Persona Strip */}
      <DemoPersonaBar
        currentPersona={currentPersonaKey}
        onSelectPersona={switchPersona}
        currentUser={currentUser}
        isLoading={isLoading}
      />

      {/* Sub-navigation for "More" tab views (Analytics, Merchant, Admin) */}
      {["analytics", "merchant", "admin"].includes(activeTab) && (
        <div className="bg-white border-b border-[#E5E9EE] px-4 py-2 flex items-center space-x-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-[#003087] text-white"
                : "bg-[#F5F7FA] text-[#536477]"
            }`}
          >
            Ledger & Data
          </button>
          <button
            onClick={() => setActiveTab("merchant")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === "merchant"
                ? "bg-[#003087] text-white"
                : "bg-[#F5F7FA] text-[#536477]"
            }`}
          >
            Merchant Hub
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === "admin"
                ? "bg-[#003087] text-white"
                : "bg-[#F5F7FA] text-[#536477]"
            }`}
          >
            Operations
          </button>
        </div>
      )}

      {/* Main Scrollable Content */}
      <main className="app-content px-3.5 py-3.5">
        {activeTab === "dashboard" && (
          <div className="view-enter">
            <CustomerDashboardView
              insights={spendingInsights}
              recommendations={recommendations}
              onSelectCouponForCheckout={handleOpenCheckout}
              onExploreMoreRecommendations={() => setActiveTab("recommendations")}
              onNavigateToGivingTab={() => setActiveTab("giving_day")}
            />
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="view-enter">
            <RecommendationsView
              recommendations={recommendations}
              onSelectCouponForCheckout={handleOpenCheckout}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === "marketplace" && (
          <div className="view-enter">
            <MarketplaceView
              coupons={coupons}
              onSelectCouponForCheckout={handleOpenCheckout}
              onFilterChange={handleFilterChange}
            />
          </div>
        )}

        {activeTab === "giving_day" && (
          <div className="view-enter">
            <SocialImpactView
              currentUser={currentUser}
              onOpenGivingDayModal={() => setIsGivingDayModalOpen(true)}
            />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="view-enter">
            <AnalyticsView />
          </div>
        )}

        {activeTab === "merchant" && (
          <div className="view-enter">
            <MerchantView currentUser={currentUser} />
          </div>
        )}

        {activeTab === "admin" && (
          <div className="view-enter">
            <AdminView />
          </div>
        )}
      </main>

      {/* Fixed Bottom Navigation Bar & Floating AI Copilot */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        toggleAgent={() => setIsAgentDrawerOpen(!isAgentDrawerOpen)}
        isAgentOpen={isAgentDrawerOpen}
      />

      {/* PayPal Global Giving Day Modal */}
      <GlobalGivingDayModal
        isOpen={isGivingDayModalOpen}
        onClose={() => setIsGivingDayModalOpen(false)}
        onGoToRewardsForGood={() => setActiveTab("giving_day")}
      />

      {/* PayPal Sandbox Checkout Modal */}
      <PayPalCheckoutModal
        coupon={selectedCouponForCheckout}
        currentUser={currentUser}
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Agentic Commerce Copilot Drawer */}
      <AgenticCommerceDrawer
        isOpen={isAgentDrawerOpen}
        onClose={() => setIsAgentDrawerOpen(false)}
        currentUser={currentUser}
        onSelectCouponForCheckout={handleOpenCheckout}
      />
    </div>
  );
}
