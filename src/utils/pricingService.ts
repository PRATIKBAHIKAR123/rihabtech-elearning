import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export interface PricingPlan {
  id: string;
  firebaseId?: string; // Firebase document ID
  name: string;
  description: string;
  longDescription?: string; // CKEditor content
  duration: number | string; // in months, can be string from Firebase
  durationText: string; // e.g., "1 Month", "6 Months", "1 Year"
  basePrice: number;
  totalAmount?: number; // Total amount including tax
  taxPercentage: number;
  platformFeePercentage: number;
  isActive: boolean;
  categoryId?: string; // for category-specific pricing
  categoryName?: string;
  isAllCategories: boolean; // true for platform-wide access
  
  // New fields for frontend pricing cards
  generalFeatures: string[]; // Bullet points like "HD video quality", "Mobile access"
  keyFeatures: string[]; // Checked features like "Unlimited course access"
  prioritySupport: boolean; // For 6+ month plans
  exclusiveContent: boolean; // For 6+ month plans
  premiumFeatures: boolean; // For annual plans
  earlyAccess: boolean; // For annual plans
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PricingCategory {
  id: string;
  name: string;
  subCategories: string[];
  pricingPlans: PricingPlan[];
}

export interface PricingBreakdown {
  basePrice: number;
  taxAmount: number;
  platformFee: number;
  instructorShare: number;
  totalPrice: number;
}

class PricingService {
  private pricingPlans: PricingPlan[] = [];
  private categories: PricingCategory[] = [];

  // Fetch all pricing plans from Firebase
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      if (this.pricingPlans.length > 0) {
        return this.pricingPlans;
      }

      console.log('Fetching pricing plans from Firebase...');
      const pricingRef = collection(db, 'pricingPlans');
      
      // Remove orderBy since duration is string, just get all active plans
      const q = query(pricingRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      console.log(`Found ${snapshot.docs.length} pricing plans in Firebase`);
      
      this.pricingPlans = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        console.log('Processing plan:', doc.id, data);
        
        return {
          id: doc.id,
          firebaseId: doc.id,
          name: data?.name || 'Untitled Plan',
          description: data?.description || '',
          longDescription: data?.longDescription || '',
          duration: data?.duration || 1,
          durationText: data?.durationText || '1 Month',
          basePrice: data?.basePrice || 0,
          totalAmount: data?.totalAmount || 0,
          taxPercentage: data?.taxPercentage || 18,
          platformFeePercentage: data?.platformFeePercentage || 40,
          isActive: data?.isActive !== false,
          categoryId: data?.categoryId,
          categoryName: data?.categoryName,
          isAllCategories: data?.isAllCategories !== false,
          generalFeatures: data?.generalFeatures || [],
          keyFeatures: data?.keyFeatures || [],
          prioritySupport: data?.prioritySupport || false,
          exclusiveContent: data?.exclusiveContent || false,
          premiumFeatures: data?.premiumFeatures || false,
          earlyAccess: data?.earlyAccess || false,
          createdAt: data?.createdAt?.toDate(),
          updatedAt: data?.updatedAt?.toDate()
        } as PricingPlan;
      });

      // Sort plans by duration after fetching (convert string to number for sorting)
      this.pricingPlans.sort((a, b) => {
        const durationA = typeof a.duration === 'string' ? parseInt(a.duration) : a.duration;
        const durationB = typeof b.duration === 'string' ? parseInt(b.duration) : b.duration;
        return durationA - durationB;
      });

      console.log('Final pricing plans:', this.pricingPlans);
      return this.pricingPlans;
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      // Return default pricing plans if Firebase fails
      return this.getDefaultPricingPlans();
    }
  }

  // Get pricing plans by category
  async getPricingPlansByCategory(categoryId?: string): Promise<PricingPlan[]> {
    const allPlans = await this.getPricingPlans();
    
    if (!categoryId) {
      // Return all categories plans
      return allPlans.filter(plan => plan.isAllCategories);
    }
    
    // Return only category-specific plans when a specific category is requested
    return allPlans.filter(plan => plan.categoryId === categoryId);
  }

  // Get categories with pricing
  async getCategoriesWithPricing(): Promise<PricingCategory[]> {
    try {
      if (this.categories.length > 0) {
        return this.categories;
      }

      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);

      this.categories = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown Category',
          subCategories: data.subCategories || [],
          pricingPlans: []
        } as PricingCategory;
      });

      // Get pricing plans for each category
      for (const category of this.categories) {
        category.pricingPlans = await this.getPricingPlansByCategory(category.id);
      }

      return this.categories;
    } catch (error) {
      console.error('Error fetching categories with pricing:', error);
      return this.getDefaultCategories();
    }
  }

  // Calculate pricing breakdown
  calculatePricingBreakdown(plan: PricingPlan): PricingBreakdown {
    // Use totalAmount if basePrice is 0 or not set
    const totalAmount = (plan as any).totalAmount || 0;
    const basePrice = plan.basePrice || 0;
    
    console.log('Pricing calculation for plan:', plan.name);
    console.log('Original basePrice:', basePrice);
    console.log('Total amount:', totalAmount);
    console.log('Tax percentage:', plan.taxPercentage);
    
    // If basePrice is 0 but totalAmount exists, calculate basePrice from totalAmount
    let calculatedBasePrice = basePrice;
    if (basePrice === 0 && totalAmount > 0) {
      // Reverse calculate basePrice from totalAmount
      // totalAmount = basePrice + (basePrice * taxPercentage / 100)
      // totalAmount = basePrice * (1 + taxPercentage / 100)
      // basePrice = totalAmount / (1 + taxPercentage / 100)
      calculatedBasePrice = totalAmount / (1 + plan.taxPercentage / 100);
      console.log('Calculated basePrice from totalAmount:', calculatedBasePrice);
    }
    
    const taxAmount = (calculatedBasePrice * plan.taxPercentage) / 100;
    const platformFee = (calculatedBasePrice * plan.platformFeePercentage) / 100;
    const instructorShare = calculatedBasePrice - platformFee;
    const totalPrice = totalAmount > 0 ? totalAmount : calculatedBasePrice + taxAmount;

    console.log('Final pricing breakdown:', {
      basePrice: calculatedBasePrice,
      taxAmount,
      platformFee,
      instructorShare,
      totalPrice
    });

    return {
      basePrice: calculatedBasePrice,
      taxAmount,
      platformFee,
      instructorShare,
      totalPrice
    };
  }

  // Get default pricing plans (fallback)
  private getDefaultPricingPlans(): PricingPlan[] {
    return [
      {
        id: 'default-monthly',
        name: 'Monthly Plan',
        description: 'Access to all courses for 1 month',
        duration: 1,
        durationText: '1 Month',
        basePrice: 5000,
        taxPercentage: 18,
        platformFeePercentage: 40,
        isActive: true,
        isAllCategories: true,
        generalFeatures: [
          'Access to all courses in selected category',
          'HD video quality',
          'Mobile and desktop access',
          'Certificate upon completion',
          '24/7 customer support'
        ],
        keyFeatures: [
          'Unlimited course access',
          'Downloadable resources',
          'Progress tracking',
          'Community forum access',
          'Regular content updates'
        ],
        prioritySupport: false,
        exclusiveContent: false,
        premiumFeatures: false,
        earlyAccess: false
      },
      {
        id: 'default-semiannual',
        name: '6 Months Plan',
        description: 'Access to all courses for 6 months',
        duration: 6,
        durationText: '6 Months',
        basePrice: 10000,
        taxPercentage: 18,
        platformFeePercentage: 40,
        isActive: true,
        isAllCategories: true,
        generalFeatures: [
          'Access to all courses in selected category',
          'HD video quality',
          'Mobile and desktop access',
          'Certificate upon completion',
          '24/7 customer support',
          'Priority customer support',
          'Exclusive content access'
        ],
        keyFeatures: [
          'Unlimited course access',
          'Downloadable resources',
          'Progress tracking',
          'Community forum access',
          'Regular content updates'
        ],
        prioritySupport: true,
        exclusiveContent: true,
        premiumFeatures: false,
        earlyAccess: false
      },
      {
        id: 'default-annual',
        name: 'Annual Plan',
        description: 'Access to all courses for 1 year',
        duration: 12,
        durationText: '1 Year',
        basePrice: 15000,
        taxPercentage: 18,
        platformFeePercentage: 40,
        isActive: true,
        isAllCategories: true,
        generalFeatures: [
          'Access to all courses in selected category',
          'HD video quality',
          'Mobile and desktop access',
          'Certificate upon completion',
          '24/7 customer support',
          'Priority customer support',
          'Exclusive content access',
          'All premium features included',
          'Early access to new courses'
        ],
        keyFeatures: [
          'Unlimited course access',
          'Downloadable resources',
          'Progress tracking',
          'Community forum access',
          'Regular content updates'
        ],
        prioritySupport: true,
        exclusiveContent: true,
        premiumFeatures: true,
        earlyAccess: true
      }
    ];
  }

  // Get default categories (fallback)
  private getDefaultCategories(): PricingCategory[] {
    return [
      {
        id: 'sap',
        name: 'SAP',
        subCategories: ['SAP ABAP', 'SAP MM', 'SAP SD', 'SAP FI'],
        pricingPlans: []
      },
      {
        id: 'school',
        name: 'School',
        subCategories: ['CBSE', 'State Board', 'ICSE'],
        pricingPlans: []
      },
      {
        id: 'technology',
        name: 'Technology',
        subCategories: ['Web Development', 'Mobile Development', 'Data Science'],
        pricingPlans: []
      }
    ];
  }

  // Clear cache
  clearCache(): void {
    this.pricingPlans = [];
    this.categories = [];
    console.log('Cache cleared, will fetch fresh data from Firebase');
  }

  // Force refresh from Firebase (ignores cache)
  async refreshPricingPlans(): Promise<PricingPlan[]> {
    console.log('Forcing refresh from Firebase...');
    this.clearCache();
    return await this.getPricingPlans();
  }
}

export const pricingService = new PricingService();

// Export the getPricingPlans function for direct use
export const getPricingPlans = () => pricingService.getPricingPlans();

export default pricingService;
