import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in months
  durationText: string; // e.g., "1 Month", "6 Months", "1 Year"
  basePrice: number;
  taxPercentage: number;
  platformFeePercentage: number;
  isActive: boolean;
  categoryId?: string; // for category-specific pricing
  categoryName?: string;
  isAllCategories: boolean; // true for platform-wide access
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

      const pricingRef = collection(db, 'pricingPlans');
      const q = query(pricingRef, where('isActive', '==', true), orderBy('duration', 'asc'));
      const snapshot = await getDocs(q);

      this.pricingPlans = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Untitled Plan',
          description: data.description || '',
          duration: data.duration || 1,
          durationText: data.durationText || '1 Month',
          basePrice: data.basePrice || 0,
          taxPercentage: data.taxPercentage || 18,
          platformFeePercentage: data.platformFeePercentage || 40,
          isActive: data.isActive !== false,
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          isAllCategories: data.isAllCategories !== false,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as PricingPlan;
      });

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
    
    // Return category-specific plans
    return allPlans.filter(plan => 
      plan.categoryId === categoryId || plan.isAllCategories
    );
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
    const basePrice = plan.basePrice;
    const taxAmount = (basePrice * plan.taxPercentage) / 100;
    const platformFee = (basePrice * plan.platformFeePercentage) / 100;
    const instructorShare = basePrice - platformFee;
    const totalPrice = basePrice + taxAmount;

    return {
      basePrice,
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
        isAllCategories: true
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
        isAllCategories: true
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
        isAllCategories: true
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
  }
}

export const pricingService = new PricingService();
export default pricingService;
