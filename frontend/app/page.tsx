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

      // Route tab automatically if merchant or admin persona is selected
      if (user.role === "merchant") {
        setActiveTab("merchant");
      } else if (user.role === "admin") {
        setActiveTab("admin");
      } else {
        // Customer profile: load data
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
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans">
      {/* Global Giving Day Announcement Top Bar */}
      <GlobalGivingDayBanner
        onOpenGivingDayModal={() => setIsGivingDayModalOpen(true)}
        onNavigateToGivingTab={() => setActiveTab("giving_day")}
      />

      {/* 1-Click Demo Persona Bar */}
      <DemoPersonaBar
        currentPersona={currentPersonaKey}
        onSelectPersona={switchPersona}
        currentUser={currentUser}
        isLoading={isLoading}
      />

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        toggleAgent={() => setIsAgentDrawerOpen(!isAgentDrawerOpen)}
        isAgentOpen={isAgentDrawerOpen}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <CustomerDashboardView
            insights={spendingInsights}
            recommendations={recommendations}
            onSelectCouponForCheckout={handleOpenCheckout}
            onExploreMoreRecommendations={() => setActiveTab("recommendations")}
            onNavigateToGivingTab={() => setActiveTab("giving_day")}
          />
        )}

        {activeTab === "recommendations" && (
          <RecommendationsView
            recommendations={recommendations}
            onSelectCouponForCheckout={handleOpenCheckout}
            isLoading={isLoading}
          />
        )}

        {activeTab === "marketplace" && (
          <MarketplaceView
            coupons={coupons}
            onSelectCouponForCheckout={handleOpenCheckout}
            onFilterChange={handleFilterChange}
          />
        )}

        {activeTab === "giving_day" && (
          <SocialImpactView
            currentUser={currentUser}
            onOpenGivingDayModal={() => setIsGivingDayModalOpen(true)}
          />
        )}

        {activeTab === "analytics" && <AnalyticsView />}

        {activeTab === "merchant" && <MerchantView currentUser={currentUser} />}

        {activeTab === "admin" && <AdminView />}
      </main>

      {/* PayPal Global Giving Day Explainer & Cause Voting Modal */}
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

      {/* Footer (PayPal Style) */}
      <footer className="border-t border-[#DDE3EA] bg-white py-6 mt-12 text-center text-xs text-[#536477]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#003087]">PayPal</span>
            <span className="font-bold text-[#0070E0]">SmartRewards AI</span>
            <span>•</span>
            <span className="text-[#536477]">PayPal AI Hackathon 2026</span>
          </div>
          <p className="text-[#536477]">
            Official PayPal Orders API v2 Sandbox Integration & Machine Learning Recommendation Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
