// Pricing.tsx
import { Check, Loader2 } from "lucide-react";
import TrustAndEducationSections from "../landingPage/trustedcustomers";
import BestEducationSections from "../landingPage/besteducation";
import NewCourses from "./new-courses";
import PracticeAdvice from "./besteducation";
import { useState, useEffect, use } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { SubscriptionPaymentModal } from "../../../components/ui/SubscriptionPaymentModal";
import { pricingService, PricingPlan, PricingBreakdown } from "../../../utils/pricingService";
import { getUserActiveSubscription, Subscription } from "../../../utils/subscriptionService";
import { couponService, Coupon } from "../../../utils/couponService";

type AppliedCoupon = {
  couponId: string;
  code: string;
  planId: string;
  finalPrice: number;
  discount: number;
  originalPrice: number;
  // additional coupon metadata as needed
};

export default function Pricing() {
  const { user } = useAuth();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);

  // coupon related states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCouponsModal, setShowCouponsModal] = useState(false);

  useEffect(() => {
    loadPricingData();
  }, []);

  useEffect(() => {
    // load active subscription whenever user signs in or after refresh
    if (user?.uid) {
      getUserActiveSubscription(user.email || user.uid).then((sub) => {
        setActiveSubscription(sub);
      }).catch(err => {
        console.error("Failed to load active subscription:", err);
      });
    } else {
      setActiveSubscription(null);
    }
  }, [user]);

  useEffect(() => {
    // reload available coupons when category changes
    if(user){
    loadAvailableCoupons();
    }
  }, [user,selectedCategory]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      const plans = await pricingService.refreshPricingPlans();
      setPricingPlans(plans);

      const categoriesData = await pricingService.getCategoriesWithPricing();
      const categoryOptions = [
        { id: "all", name: "All Categories" },
        ...categoriesData.map((c: any) => ({ id: c.id, name: c.name })),
      ];
      setCategories(categoryOptions);
    } catch (error) {
      console.error("Error loading pricing data:", error);
      toast.error("Failed to load pricing information");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCoupons = async () => {
    try {
      // couponService.getAvailableCoupons should return Coupon[] normalized with validFrom/validUntil as Date
      const coupons = await couponService.getAvailableCoupons(user?.email||user?.uid||"",[selectedCategory]);
      console.log("Available coupons:", coupons);
      setAvailableCoupons(coupons || []);
    } catch (err) {
      console.error("Error loading coupons:", err);
    }
  };

  // Pricing helpers
  const calculatePrice = (plan: PricingPlan) => {
    const gstRate = typeof plan.gstRate === "number" ? plan.gstRate : (plan.gstRate ? Number(plan.gstRate) : 0);
    const basePrice = typeof plan.basePrice === "number" ? plan.basePrice : Number(plan.basePrice || 0);
    const gstAmount = (basePrice * (gstRate || 0)) / 100;
    return Math.round((basePrice + gstAmount) * 100) / 100; // round to 2 decimals
  };

  const getFinalPrice = (plan: PricingPlan): number => {
    return appliedCoupon?.planId === plan.id ? appliedCoupon.finalPrice : calculatePrice(plan);
  };

  const getDiscount = (plan: PricingPlan): number => {
    return appliedCoupon?.planId === plan.id ? appliedCoupon.discount : 0;
  };

  const getCouponDisplayText = (coupon: any) => {
    if (!coupon) return "";
    if (coupon.type === "percentage") return `${coupon.value}% OFF`;
    return `₹${coupon.value} OFF`;
  };

  const isExpiringSoon = (coupon: any) => {
    if (!coupon?.validUntil) return false;
    const until = coupon.validUntil instanceof Date ? coupon.validUntil : new Date(coupon.validUntil);
    const now = new Date();
    const days = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days <= 7 && days > 0;
  };

  // coupon application
  const handleApplyCoupon = async (plan: PricingPlan, codeToApply?: string) => {
    const code = (codeToApply || couponCode || "").trim();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    setSelectedPlanForCoupon(plan.id);
    try {
      const originalPrice = calculatePrice(plan);
      const userId = user?.email || user?.uid || "guest";

      // validateCoupon should return { isValid, message?, finalAmount?, discountAmount?, coupon? }
      const couponResponse: any = await couponService.validateCoupon(code, plan.totalAmount??0, userId, [plan.categoryId??'']);

      if (!couponResponse || !couponResponse.isValid) {
        setCouponError(couponResponse?.message || "Invalid coupon");
        setAppliedCoupon(null);
      } else {
        const finalPrice = couponResponse.finalAmount ?? originalPrice;
        const discount = couponResponse.discountAmount ?? 0;
        const couponObj = couponResponse.coupon;
        setAppliedCoupon({
          couponId: couponObj?.id ?? couponObj?.code ?? code,
          code: couponObj?.code ?? code,
          planId: plan.id,
          finalPrice,
          discount,
          originalPrice,
        });
        setCouponCode(couponObj?.code ?? code);
        setCouponError("");
        toast.success("Coupon applied");
      }
    } catch (err) {
      console.error("Coupon apply error:", err);
      setCouponError("Failed to apply coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
      setSelectedPlanForCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Subscription actions
  const handleStartSubscription = (plan: PricingPlan) => {
    if (!user) {
      toast.error("Please log in to purchase a subscription");
      window.location.hash = "#/login";
      return;
    }
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const refreshActiveSubscription = async () => {
    if (!user) return;
    try {
      const sub = await getUserActiveSubscription(user.email || user.uid);
      setActiveSubscription(sub);
    } catch (err) {
      console.error("Failed to refresh subscription:", err);
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success("Subscription activated successfully!");
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);

    // refresh active subscription so UI shows updated current plan
    await refreshActiveSubscription();

    const redirectUrl = localStorage.getItem("redirectAfterSubscription");
    if (redirectUrl) {
      window.location.hash = redirectUrl;
      // cleanup will be done by route watcher in your app (or you can remove here after navigation completes)
    } else {
      window.location.hash = "#/learner/homepage";
    }
  };

  // Plan feature helpers
  const getPricingBreakdown = (plan: PricingPlan): PricingBreakdown => {
    return pricingService.calculatePricingBreakdown(plan);
  };

  const getPlanFeatures = (plan: PricingPlan) => {
    if (plan.generalFeatures && plan.generalFeatures.length > 0) {
      return plan.generalFeatures.map((f: string) => ({ text: f }));
    }
    const baseFeatures = [
      { text: "Access to all courses in selected category" },
      { text: "HD video quality" },
      { text: "Mobile and desktop access" },
      { text: "Certificate upon completion" },
      { text: "24/7 customer support" },
    ];
    const duration = typeof plan.duration === "string" ? parseInt(plan.duration) : (plan.duration || 0);
    if (duration >= 6) {
      baseFeatures.push({ text: "Priority customer support" });
      baseFeatures.push({ text: "Exclusive content access" });
    }
    if (duration >= 12) {
      baseFeatures.push({ text: "All premium features included" });
      baseFeatures.push({ text: "Early access to new courses" });
    }
    return baseFeatures;
  };

  const getKeyFeatures = (plan: PricingPlan) => {
    if (plan.keyFeatures && plan.keyFeatures.length > 0) {
      return plan.keyFeatures.map((f: string) => ({ text: f }));
    }
    return [
      { text: "Unlimited course access" },
      { text: "Downloadable resources" },
      { text: "Progress tracking" },
      { text: "Community forum access" },
      { text: "Regular content updates" },
    ];
  };

  // Filter plans: show all if selectedCategory === 'all'
  const filteredPlans = pricingPlans.filter((plan) => {
    if (selectedCategory === "all") return true;
    return plan.categoryId === selectedCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Loading pricing plans...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="banner-section-title text-center my-12">Choose the plan that fits your needs.</h1>

      {/* Category Selection */}
      <div className="px-4 md:px-16 mb-8">
        <div className="text-center mb-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full border-2 transition-all ${
                  selectedCategory === category.id ? "border-primary bg-primary text-white" : "border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <section className="p-4 md:px-16">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Plans Available</h3>
            <p className="text-gray-500">No pricing plans are currently available for the selected category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:-gap-8">
            {filteredPlans.map((plan, index) => {
              const breakdown = getPricingBreakdown(plan);
              const isCurrentPlan = activeSubscription?.planId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-8 ${isCurrentPlan
                    ? "bg-white rounded-[44px] shadow-[0px_24px_83px_0px_rgba(0,0,0,0.10)] transform md:scale-105 z-10"
                    : "bg-orange-50 rounded-[44px]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className={`text-2xl font-bold ${isCurrentPlan ? "text-green-700" : "text-purple-900"}`}>
                        {plan.name}
                      </h2>
                      <p className="text-gray-600 mt-1">{plan.description}</p>
                    </div>
                    {isCurrentPlan && (
                      <div className="ml-4">
                        <span className="inline-block mt-1 px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Current Plan</span>
                      </div>
                    )}
                  </div>

                  {/* long description */}
                  {plan.longDescription && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: plan.longDescription }} />
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-xl font-semibold">
                      {plan.durationText} - ₹{breakdown.totalPrice.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Total Price (Tax Inclusive)</p>
                  </div>

                  {/* Coupon input + actions */}
                  <div className="mt-4">
                    {appliedCoupon?.planId === plan.id ? (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                        <div>
                          <div className="text-sm font-medium">Coupon applied: {appliedCoupon.code}</div>
                          <div className="text-xs text-gray-600">You saved ₹{appliedCoupon.discount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">₹{appliedCoupon.finalPrice.toLocaleString()}</div>
                          <button onClick={handleRemoveCoupon} className="text-xs text-red-600 mt-1">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 border rounded-md px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => handleApplyCoupon(plan)}
                          className="bg-primary text-white px-4 rounded-md text-sm"
                          disabled={couponLoading || selectedPlanForCoupon === plan.id}
                        >
                          {couponLoading && selectedPlanForCoupon === plan.id ? "Applying..." : "Apply"}
                        </button>
                        <button
                          onClick={() => { setShowCouponsModal(true); setSelectedPlanForCoupon(plan.id); }}
                          className="bg-white border px-3 rounded-md text-sm"
                        >
                          Browse
                        </button>
                      </div>
                    )}
                    {couponError && <div className="text-xs text-red-600 mt-1">{couponError}</div>}
                  </div>

                  {/* action button */}
                  <div className="mt-6">
                    {!isCurrentPlan ? (
                      <button
                        className="mt-2 bg-primary border border-4 border-[#EFF0FF] text-white py-3 px-6 rounded-full font-medium hover:shadow-lg transition duration-300"
                        onClick={() => handleStartSubscription(plan)}
                      >
                        Start Subscription
                      </button>
                    ) : (
                      <button disabled className="mt-2 bg-gray-300 text-gray-600 py-3 px-6 rounded-full font-medium cursor-not-allowed">Active</button>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2">
                    {getPlanFeatures(plan).map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-700">
                        <span className="text-black mr-2">•</span>
                        {feature.text}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-800 mb-3">Key Features</h4>
                    <ul className="space-y-3">
                      {getKeyFeatures(plan).map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <Check className="h-5 w-5 text-black mr-2 flex-shrink-0" />
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Coupons Modal (simple) */}
      {showCouponsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCouponsModal(false); setSelectedPlanForCoupon(null); }} />
          <div className="bg-white rounded-lg p-6 z-10 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Available Coupons</h3>
              <button onClick={() => { setShowCouponsModal(false); setSelectedPlanForCoupon(null); }} className="text-sm text-gray-600">Close</button>
            </div>

            {availableCoupons.length === 0 ? (
              <div className="text-sm text-gray-600">No coupons available.</div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-auto">
                {availableCoupons.map((c: any) => (
                  <div key={c.id || c.code} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{c.code} • {getCouponDisplayText(c)}</div>
                      <div className="text-xs text-gray-500">{c.description}</div>
                      {isExpiringSoon(c) && <div className="text-xs text-yellow-700">Expiring soon</div>}
                    </div>
                    <div className="text-right">
                      <button
                        className="bg-primary text-white text-sm px-3 py-1 rounded"
                        onClick={() => {
                          const planId = selectedPlanForCoupon;
                          if (!planId) {
                            toast.error("Please choose a plan first to apply coupon");
                            return;
                          }
                          const plan = pricingPlans.find(p => p.id === planId);
                          if (!plan) {
                            toast.error("Plan not found");
                            return;
                          }
                          handleApplyCoupon(plan, c.code);
                          setShowCouponsModal(false);
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Payment Modal */}
      {selectedPlan && (
        <SubscriptionPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPlan(null);
          }}
          onSuccess={handlePaymentSuccess}
          plan={selectedPlan}
          userDetails={{
            name: user?.displayName || "",
            email: user?.email || "",
            phone: "",
          }}
          // pass coupon info if any (optional)
          //coupon={appliedCoupon?.planId === selectedPlan.id ? { code: appliedCoupon.code, couponId: appliedCoupon.couponId } : null}
        />
      )}

      <TrustAndEducationSections />
      <PracticeAdvice />
      <NewCourses />
    </div>
  );
}
