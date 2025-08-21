import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

export interface PricingPlan {
  id?: string;
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

class FirebasePricingService {
  private readonly COLLECTION_NAME = 'pricingPlans';
  private readonly CATEGORIES_COLLECTION = 'categories';

  // Create a new pricing plan
  async createPricingPlan(plan: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const planData = {
        ...plan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), planData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      throw new Error('Failed to create pricing plan');
    }
  }

  // Get all pricing plans
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('duration', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PricingPlan[];
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw new Error('Failed to fetch pricing plans');
    }
  }

  // Get pricing plan by ID
  async getPricingPlanById(id: string): Promise<PricingPlan | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as PricingPlan;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching pricing plan:', error);
      throw new Error('Failed to fetch pricing plan');
    }
  }

  // Update pricing plan
  async updatePricingPlan(id: string, updates: Partial<PricingPlan>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      throw new Error('Failed to update pricing plan');
    }
  }

  // Delete pricing plan
  async deletePricingPlan(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      throw new Error('Failed to delete pricing plan');
    }
  }

  // Get pricing plans by category
  async getPricingPlansByCategory(categoryId?: string): Promise<PricingPlan[]> {
    try {
      let q;
      
      if (categoryId && categoryId !== 'all') {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('isActive', '==', true),
          where('categoryId', '==', categoryId),
          orderBy('duration', 'asc')
        );
      } else {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('isActive', '==', true),
          where('isAllCategories', '==', true),
          orderBy('duration', 'asc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PricingPlan[];
    } catch (error) {
      console.error('Error fetching pricing plans by category:', error);
      throw new Error('Failed to fetch pricing plans by category');
    }
  }

  // Get all categories
  async getCategories(): Promise<PricingCategory[]> {
    try {
      const q = query(collection(db, this.CATEGORIES_COLLECTION), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PricingCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Create a new category
  async createCategory(category: Omit<PricingCategory, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.CATEGORIES_COLLECTION), {
        ...category,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  // Update category
  async updateCategory(id: string, updates: Partial<PricingCategory>): Promise<void> {
    try {
      const docRef = doc(db, this.CATEGORIES_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.CATEGORIES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
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
  getDefaultPricingPlans(): PricingPlan[] {
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
  getDefaultCategories(): PricingCategory[] {
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
}

export const firebasePricingService = new FirebasePricingService();
export default firebasePricingService;
