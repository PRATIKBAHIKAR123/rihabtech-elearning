import { Check, CheckCircle2, Info } from "lucide-react";
import TrustAndEducationSections from "../landingPage/trustedcustomers";
import BestEducationSections from "../landingPage/besteducation";
import NewCourses from "./new-courses";
import PracticeAdvice from "./besteducation";

type Feature = {
    text: string;
    hasInfoIcon?: boolean;
};

type KeyFeature = {
    text: string;
    hasInfoIcon?: boolean;
};

type PricingPlan = {
    id: string;
    name: string;
    description: string;
    price: string;
    duration: string;
    highlighted?: boolean;
    features: Feature[];
    keyFeaturesTitle: string;
    keyFeatures: KeyFeature[];
};


    // Pricing data array
    const pricingPlans: PricingPlan[] = [
        {
            id: 'starter',
            name: 'Starter',
            description: 'Quick video messages',
            price: '₹5000',
            duration: '1 Month Plan',
            features: [
                { text: 'Up to 50 Creators Lite' },
                { text: 'Up to 25 videos/person' },
                { text: 'Up to 5 min/video' },
            ],
            keyFeaturesTitle: 'Key Features',
            keyFeatures: [
                { text: 'Screen recording & cam bubble' },
                { text: 'Instant editing' },
                { text: 'Unlimited transcriptions' },
                { text: 'Privacy controls' },
                { text: 'Viewer insights' },
            ],
        },
        {
            id: 'business',
            name: 'Business',
            description: 'Advanced recording & analytics',
            price: '₹10,000',
            duration: '6 Month Plan',
            highlighted: true,
            features: [
                { text: 'Up to 50 Creators Lite' },
                { text: 'Up to 25 videos/person' },
                { text: 'Up to 5 min/video' },
            ],
            keyFeaturesTitle: 'Key Features',
            keyFeatures: [
                { text: 'Screen recording & cam bubble' },
                { text: 'Instant editing' },
                { text: 'Unlimited transcriptions' },
                { text: 'Privacy controls' },
                { text: 'Viewer insights' },
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Advanced admin & security',
            price: '₹15,000',
            duration: '12 Month Plan',
            features: [
                { text: 'Up to 50 Creators Lite' },
                { text: 'Up to 25 videos/person' },
                { text: 'Up to 5 min/video' },
            ],
            keyFeaturesTitle: 'Key Features',
            keyFeatures: [
                { text: 'Screen recording & cam bubble' },
                { text: 'Instant editing' },
                { text: 'Unlimited transcriptions' },
                { text: 'Privacy controls' },
                { text: 'Viewer insights' },
            ],
        },
    ];
    


    export default function Pricing() {
        return (
            <div className="flex flex-col min-h-screen">
                <h1 className="banner-section-title text-center my-12">
                    Choose the plan that fits your needs.
                </h1>
                <section className="p-4 md:p-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:-gap-8">
                        {pricingPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`rounded-3xl p-16 cursor-pointer ${plan.highlighted
                                        ? 'bg-white rounded-[44px] shadow-[0px_24px_83px_0px_rgba(0,0,0,0.10)] shadow-[0px_5px_18px_0px_rgba(0,0,0,0.06)] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.04)] transform md:scale-105 z-10'
                                        : 'bg-orange-50 rounded-[44px]'
                                    }`}
                                    onMouseEnter={(e) => {
                                        if (!plan.highlighted) {
                                            plan.highlighted = true;
                                            e.currentTarget.classList.add('bg-white', 'shadow-xl', 'transform', 'scale-105', 'z-10');
                                        }else{
                                            plan.highlighted = false;
                                            e.currentTarget.classList.remove('bg-white', 'shadow-xl', 'transform', 'scale-105', 'z-10');
                                        }
                                    }}

                                    onMouseLeave={(e => {
                                        if (plan.highlighted) {
                                            plan.highlighted = false;
                                            e.currentTarget.classList.remove('bg-white', 'shadow-xl', 'transform', 'scale-105', 'z-10');
                                        }
                                    })}
                            >
                                <h2 className={`text-3xl font-bold ${plan.highlighted ? 'text-gray-900' : 'text-purple-900'}`}>
                                    {plan.name}
                                </h2>
                                <p className="text-gray-600 mt-2">{plan.description}</p>

                                <div className="mt-6">
                                    <h3 className="text-xl font-semibold">
                                        {plan.duration} - {plan.price}
                                    </h3>
                                </div>

                                <button className="mt-6 bg-primary border border-4 border-[#EFF0FF] text-white py-3 px-6 rounded-full font-medium hover:shadow-lg transition duration-300">
                                    Start Subscription
                                </button>

                                <ul className="mt-8 space-y-2">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-700">
                                            <span className="text-black mr-2">•</span>
                                            {feature.text}
                                            {feature.hasInfoIcon && (
                                                <Info className="h-4 w-4 text-gray-400 ml-1 cursor-pointer" />
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-10">
                                    <h4 className="font-medium text-gray-800 mb-4">{plan.keyFeaturesTitle}</h4>
                                    <ul className="space-y-3">
                                        {plan.keyFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm text-gray-700">
                                                <Check className="h-5 w-5 text-black mr-2 flex-shrink-0" />
                                                {feature.text}
                                                {feature.hasInfoIcon && (
                                                    <Info className="h-4 w-4 text-gray-400 ml-1 cursor-pointer" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                      {/* Trusted Customers */}
      <TrustAndEducationSections/>
      
      {/* Certification Section */}
      <PracticeAdvice/>

      <NewCourses/>
            </div>
        )
    }
