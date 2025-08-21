import { Check, CheckCircle2, Info, Loader2 } from "lucide-react";
import TrustAndEducationSections from "../landingPage/trustedcustomers";
import BestEducationSections from "../landingPage/besteducation";
import NewCourses from "./new-courses";
import PracticeAdvice from "./besteducation";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import CheckoutModal from "../../../components/ui/CheckoutModal";
import { pricingService, PricingPlan, PricingBreakdown } from "../../../utils/pricingService";

type Feature = {
    text: string;
    hasInfoIcon?: boolean;
};

type KeyFeature = {
    text: string;
    hasInfoIcon?: boolean;
};

export default function Pricing() {
    const { user } = useAuth();
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);

    useEffect(() => {
        loadPricingData();
    }, []);

    const loadPricingData = async () => {
        try {
            setLoading(true);
            
            // Load pricing plans
            const plans = await pricingService.getPricingPlans();
            setPricingPlans(plans);
            
            // Load categories
            const categoriesData = await pricingService.getCategoriesWithPricing();
            const categoryOptions = [
                { id: 'all', name: 'All Categories' },
                ...categoriesData.map(cat => ({ id: cat.id, name: cat.name }))
            ];
            setCategories(categoryOptions);
            
        } catch (error) {
            console.error('Error loading pricing data:', error);
            toast.error('Failed to load pricing information');
        } finally {
            setLoading(false);
        }
    };

    // Filter plans based on selected category
    const filteredPlans = pricingPlans.filter(plan => {
        if (selectedCategory === 'all') {
            return plan.isAllCategories;
        }
        return plan.categoryId === selectedCategory || plan.isAllCategories;
    });

    // Handle subscription purchase
    const handleStartSubscription = (plan: PricingPlan) => {
        if (!user) {
            toast.error('Please log in to purchase a subscription');
            window.location.hash = '#/login';
            return;
        }

        // Set selected plan and open checkout modal
        setSelectedPlan(plan);
        setIsCheckoutModalOpen(true);
    };

    // Convert plan to course format for checkout modal
    const getPlanAsCourse = (plan: PricingPlan) => {
        if (!plan) return null;
        
        const breakdown = pricingService.calculatePricingBreakdown(plan);
        
        return {
            id: `subscription-${plan.id}`,
            title: `${plan.name} - ${plan.durationText}`,
            pricing: breakdown.totalPrice.toString(),
            thumbnailUrl: "Images/icons/course-Icon.png",
            description: `${plan.description} - Full access to ${plan.isAllCategories ? 'all categories' : plan.categoryName || 'selected category'} for ${plan.durationText.toLowerCase()}.`
        };
    };

    // Get pricing breakdown for display
    const getPricingBreakdown = (plan: PricingPlan): PricingBreakdown => {
        return pricingService.calculatePricingBreakdown(plan);
    };

    // Get features based on plan duration
    const getPlanFeatures = (plan: PricingPlan): Feature[] => {
        const baseFeatures = [
            { text: 'Access to all courses in selected category' },
            { text: 'HD video quality' },
            { text: 'Mobile and desktop access' },
            { text: 'Certificate upon completion' },
            { text: '24/7 customer support' }
        ];

        if (plan.duration >= 6) {
            baseFeatures.push({ text: 'Priority customer support' });
            baseFeatures.push({ text: 'Exclusive content access' });
        }

        if (plan.duration >= 12) {
            baseFeatures.push({ text: 'All premium features included' });
            baseFeatures.push({ text: 'Early access to new courses' });
        }

        return baseFeatures;
    };

    // Get key features based on plan
    const getKeyFeatures = (plan: PricingPlan): KeyFeature[] => {
        return [
            { text: 'Unlimited course access' },
            { text: 'Downloadable resources' },
            { text: 'Progress tracking' },
            { text: 'Community forum access' },
            { text: 'Regular content updates' }
        ];
    };

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
            <h1 className="banner-section-title text-center my-12">
                Choose the plan that fits your needs.
            </h1>

            {/* Category Selection */}
            <div className="px-4 md:px-16 mb-8">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Select Category</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-6 py-2 rounded-full border-2 transition-all ${
                                    selectedCategory === category.id
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
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
                            const isHighlighted = index === 1; // Middle plan is highlighted
                            
                            return (
                                <div
                                    key={plan.id}
                                    className={`rounded-3xl p-16 ${isHighlighted
                                            ? 'bg-white rounded-[44px] shadow-[0px_24px_83px_0px_rgba(0,0,0,0.10)] shadow-[0px_5px_18px_0px_rgba(0,0,0,0.06)] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.04)] transform md:scale-105 z-10'
                                            : 'bg-orange-50 rounded-[44px]'
                                        }`}
                                >
                                    <h2 className={`text-3xl font-bold ${isHighlighted ? 'text-gray-900' : 'text-purple-900'}`}>
                                        {plan.name}
                                    </h2>
                                    <p className="text-gray-600 mt-2">{plan.description}</p>

                                    <div className="mt-6">
                                        <h3 className="text-xl font-semibold">
                                            {plan.durationText} - ₹{breakdown.totalPrice.toLocaleString()}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Base: ₹{breakdown.basePrice.toLocaleString()} + Tax: ₹{breakdown.taxAmount.toLocaleString()}
                                        </p>
                                    </div>

                                    <button 
                                        className="mt-6 bg-primary border border-4 border-[#EFF0FF] text-white py-3 px-6 rounded-full font-medium hover:shadow-lg transition duration-300"
                                        onClick={() => handleStartSubscription(plan)}
                                    >
                                        Start Subscription
                                    </button>

                                    <ul className="mt-8 space-y-2">
                                        {getPlanFeatures(plan).map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                                                <span className="text-black mr-2">•</span>
                                                {feature.text}
                                                {feature.hasInfoIcon && (
                                                    <Info className="h-4 w-4 text-gray-400 ml-1 cursor-pointer" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-10">
                                        <h4 className="font-medium text-gray-800 mb-4">Key Features</h4>
                                        <ul className="space-y-3">
                                            {getKeyFeatures(plan).map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                                                    <Check className="h-5 w-5 text-black mr-2 flex-shrink-0" />
                                                    {feature.text}
                                                    {feature.hasInfoIcon && (
                                                        <Info className="h-4 w-4 text-gray-400 ml-1 cursor-pointer" />
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Pricing Breakdown */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <h5 className="font-medium text-gray-800 mb-2">Price Breakdown</h5>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Base Price:</span>
                                                <span>₹{breakdown.basePrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tax ({plan.taxPercentage}%):</span>
                                                <span>₹{breakdown.taxAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Platform Fee ({plan.platformFeePercentage}%):</span>
                                                <span>₹{breakdown.platformFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-medium border-t pt-1">
                                                <span>Total:</span>
                                                <span>₹{breakdown.totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Trusted Customers */}
            <TrustAndEducationSections/>
            
            {/* Certification Section */}
            <PracticeAdvice/>

            <NewCourses/>

            {/* Checkout Modal */}
            {selectedPlan && (
                <CheckoutModal
                    isOpen={isCheckoutModalOpen}
                    onClose={() => {
                        setIsCheckoutModalOpen(false);
                        setSelectedPlan(null);
                    }}
                    course={getPlanAsCourse(selectedPlan)!}
                />
            )}
        </div>
    );
}
